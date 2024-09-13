const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
require("dotenv").config();

const connectionString = process.env.DB_CONNECTION_STRING;

// Create connection pool to connect to the database.
function createConnection() {
    const pool = new Pool({
        connectionString: connectionString
    });

    return pool;
}

router.get("/draft-rankings/all", async (req, res) => {
    const connection = createConnection();

    try {
        const { rows } = await connection.query(
            `
            SELECT
                draft.PLAYER_ID,
                draft.PLAYER_NAME,
                COALESCE(offense_2024.IMAGE_URL, offense_2023.IMAGE_URL) AS IMAGE_URL,
                draft.POSITION,
                COALESCE(offense_2024.TEAM, offense_2023.TEAM) AS TEAM,
                draft.ECR,
                draft.BYE,
                draft.SD,
                draft.BEST,
                draft.WORST,
                projections_2024.FNTSY_PROJ,
                COALESCE(offense_2024.FNTSY_2024, 0) AS FNTSY_2024,
                COALESCE(offense_2023.FNTSY_2023, 0) AS FNTSY_2023,
                CASE 
                    WHEN draft.POSITION = 'QB' THEN 
                        (1000 - draft.ECR) * 1.6 + 
                        COALESCE(offense_2023.FNTSY_2023, (LAG(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR) + LEAD(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR)) / 2) * 0.09 +
                        COALESCE(projections_2024.FNTSY_PROJ, 0) * 0.25 + 
                        COALESCE(offense_2024.FNTSY_2024, 0) * 0.25
                    WHEN draft.POSITION = 'TE' THEN 
                        (1000 - draft.ECR) * 1.6 + 
                        COALESCE(offense_2023.FNTSY_2023, (LAG(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR) + LEAD(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR)) / 2) * 0.1 +
                        COALESCE(projections_2024.FNTSY_PROJ, 0) * 0.2 + 
                        COALESCE(offense_2024.FNTSY_2024, 0) * 0.2
                    WHEN draft.POSITION = 'RB' THEN 
                        (1000 - draft.ECR) * 1.6 + 
                        COALESCE(offense_2023.FNTSY_2023, (LAG(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR) + LEAD(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR)) / 2) * 0.15 +
                        COALESCE(projections_2024.FNTSY_PROJ, 0) * 0.15 + 
                        COALESCE(offense_2024.FNTSY_2024, 0) * 0.15
                    WHEN draft.POSITION = 'WR' THEN 
                        (1000 - draft.ECR) * 1.6 + 
                        COALESCE(offense_2023.FNTSY_2023, (LAG(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR) + LEAD(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR)) / 2) * 0.1 +
                        COALESCE(projections_2024.FNTSY_PROJ, 0) * 0.2 + 
                        COALESCE(offense_2024.FNTSY_2024, 0) * 0.2
                    ELSE 
                        (1000 - draft.ECR) * 1.4 + 
                        COALESCE(offense_2023.FNTSY_2023, (LAG(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR) + LEAD(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR)) / 2) * 0.6 +
                        COALESCE(projections_2024.FNTSY_PROJ, 0) * 0.2 + 
                        COALESCE(offense_2024.FNTSY_2024, 0) * 0.2
                END AS ELO
            FROM
                (
                    SELECT
                        d.id AS PLAYER_ID,
                        d.player AS PLAYER_NAME,
                        d.pos AS POSITION,
                        d.team AS TEAM,
                        d.ecr AS ECR,
                        d.bye AS BYE,
                        d.sd as SD,
                        d.best as BEST,
                        d.worst as WORST
                    FROM
                        draft_rankings d
                    WHERE
                        d.page_type = 'redraft-overall' AND d.pos <> 'DST' AND d.pos <> 'K'
                    ORDER BY
                        d.ecr
                ) AS draft
            LEFT JOIN 
                (
                    SELECT
                        off.player_display_name AS PLAYER_NAME,
                        t.initials AS TEAM,
                        off.headshot_url AS IMAGE_URL,
                        SUM(off.fantasy_points_ppr) AS FNTSY_2023
                    FROM
                        offense_stats off
                        join teams t on t."teamID" = off.recent_team
                    WHERE
                        off.season = 2023 AND off.season_type = 'REG'
                    GROUP BY
                        off.player_display_name, t.initials, off.headshot_url
                ) AS offense_2023
            ON
                draft.PLAYER_NAME = offense_2023.PLAYER_NAME
            LEFT JOIN 
                (
                    SELECT
                        off.player_display_name AS PLAYER_NAME,
                        t.initials AS TEAM,
                        off.headshot_url AS IMAGE_URL,
                        SUM(off.fantasy_points_ppr) AS FNTSY_2024
                    FROM
                        offense_stats off
                        join teams t on t."teamID" = off.recent_team
                    WHERE
                        off.season = 2024 AND off.season_type = 'REG'
                    GROUP BY
                        off.player_display_name, t.initials, off.headshot_url
                ) AS offense_2024
            ON
                draft.PLAYER_NAME = offense_2024.PLAYER_NAME
            LEFT JOIN 
                (
                    SELECT
                        p.player_name AS PLAYER_NAME,
                        SUM(p.fpts) AS FNTSY_PROJ
                    FROM
                        draft_projections p
                    WHERE
                        p."Position" <> 'FLEX'
                    GROUP BY
                        p.player_name
                ) AS projections_2024
            ON
                draft.PLAYER_NAME = projections_2024.PLAYER_NAME
            WHERE
                (draft.position <> 'DST' AND draft.position <> 'K')
            ORDER BY
                draft.ECR;
        `);

        res.status(200).send(rows);
    } catch (error) {
        console.error("An error occurred while fetching the 'ALL' draft rankings:", error);
        res.status(500).send("An error occurred while fetching the 'ALL' draft rankings");
    } finally {
        await connection.end();
    }
});

router.get("/draft-rankings/qb", async (req, res) => {
    const connection = createConnection();

    try {
        const { rows } = await connection.query(
            `
            SELECT
                draft.player_id,
                draft.player_name,
                COALESCE(offense_2024.image_url, offense_2023.image_url) AS IMAGE_URL,
                draft.position,
                COALESCE(offense_2024.team, offense_2023.team) AS TEAM,
                draft.ecr,
                draft.bye,
                draft.sd,
                draft.best,
                draft.worst,
                projections_2024.projected_completion_percentage,
                projections_2024.projected_passing_yds,
                projections_2024.projected_passing_tds,
                projections_2024.projected_rushing_attempts,
                projections_2024.projected_rushing_yds,
                projections_2024.projected_rushing_tds,
                projections_2024.projected_fpts,
                COALESCE(offense_2024.fpts_2024, 0) AS fpts_2024,
                COALESCE(offense_2023.fpts_2023, 0) AS fpts_2023,
                (1000 - draft.ecr) * 1.6 + COALESCE(
                    offense_2023.fpts_2023, 
                    (LAG(offense_2023.fpts_2023) OVER (PARTITION BY draft.position ORDER BY draft.ecr) 
                    + LEAD(offense_2023.fpts_2023) OVER (PARTITION BY draft.position ORDER BY draft.ecr)) / 2
                ) * 0.09 AS elo
            FROM
                (
                    SELECT
                        d.id AS player_id,
                        d.player AS player_name,
                        d.pos AS position,
                        d.team AS team,
                        d.ecr AS ecr,
                        d.bye AS bye,
                        d.sd as sd,
                        d.best as best,
                        d.worst as worst
                    FROM
                        draft_rankings d
                    WHERE
                        d.page_type = 'redraft-overall'
                    ORDER BY
                        d.ecr
                ) AS draft
            LEFT JOIN 
                (
                    SELECT
                        off.player_display_name AS player_name,
                        t.initials AS team,
                        off.headshot_url AS image_url,
                        SUM(off.fantasy_points_ppr) AS fpts_2023
                    FROM
                        offense_stats off
                        join teams t on t."teamID" = off.recent_team
                    WHERE
                        off.season = 2023 AND off.season_type = 'REG'
                    GROUP BY
                        off.player_display_name, t.initials, off.headshot_url
                ) AS offense_2023
            ON
                draft.player_name = offense_2023.player_name
            LEFT JOIN 
                (
                    SELECT
                        off.player_display_name AS player_name,
                        t.initials AS team,
                        off.headshot_url AS image_url,
                        SUM(off.fantasy_points_ppr) AS fpts_2024
                    FROM
                        offense_stats off
                        join teams t on t."teamID" = off.recent_team
                    WHERE
                        off.season = 2024 AND off.season_type = 'REG'
                    GROUP BY
                        off.player_display_name, t.initials, off.headshot_url
                ) AS offense_2024
            ON
                draft.player_name = offense_2024.player_name
            LEFT JOIN 
                (
                    SELECT
                        p.player_name AS player_name,
                        ROUND(AVG(100 * p.passing_cmp / NULLIF(p.passing_att, 0))::numeric, 2) AS projected_completion_percentage,
                        SUM(p.passing_yds) AS projected_passing_yds,
                        SUM(p.passing_tds) AS projected_passing_tds,
                        SUM(p.passing_ints) AS projected_passing_ints,
                        SUM(p.rushing_att) AS projected_rushing_attempts,
                        SUM(p.rushing_yds) AS projected_rushing_yds,
                        SUM(p.rushing_tds) AS projected_rushing_tds,
                        SUM(p.fpts) AS projected_fpts
                    FROM
                        draft_projections p
                    WHERE
                    p."Position" <> 'RB' AND p."Position" <> 'WR' AND p."Position" <> 'TE' AND "Position" <> 'FLEX' AND p."Position" <> 'DST' AND p."Position" <> 'K'
                    GROUP BY
                        p.player_name
                ) AS projections_2024
            ON
                draft.player_name = projections_2024.player_name
            WHERE
                draft.position = 'QB'
            ORDER BY
                draft.ecr;
        `);

        res.status(200).send(rows);
    } catch (error) {
        console.error("An error occurred while fetching the 'QB' draft rankings:", error);
        res.status(500).send("An error occurred while fetching the 'QB' draft rankings");
    } finally {
        await connection.end();
    }
});

router.get("/draft-rankings/rb", async (req, res) => {
    const connection = createConnection();

    try {
        const { rows } = await connection.query(
            `
            SELECT
                draft.player_id,
                draft.player_name,
                COALESCE(offense_2024.image_url, offense_2023.image_url) AS IMAGE_URL,
                draft.position,
                COALESCE(offense_2024.team, offense_2023.team) AS TEAM,
                draft.ecr,
                draft.bye,
                draft.sd,
                draft.best,
                draft.worst,
                projections_2024.projected_rushing_attempts,
                projections_2024.projected_rushing_yds,
                projections_2024.projected_rushing_tds,
                projections_2024.projected_receiving_rec,
                projections_2024.projected_receiving_yds,
                projections_2024.projected_receiving_tds,
                projections_2024.projected_fpts,
                COALESCE(offense_2024.fpts_2024, 0) AS fpts_2024,
                COALESCE(offense_2023.fpts_2023, 0) AS fpts_2023,
                (1000 - draft.ecr) * 1.6 + COALESCE(
                    offense_2023.fpts_2023, 
                    (LAG(offense_2023.fpts_2023) OVER (PARTITION BY draft.position ORDER BY draft.ecr) 
                    + LEAD(offense_2023.fpts_2023) OVER (PARTITION BY draft.position ORDER BY draft.ecr)) / 2
                ) * 0.09 AS elo
            FROM
                (
                    SELECT
                        d.id AS player_id,
                        d.player AS player_name,
                        d.pos AS position,
                        d.team AS team,
                        d.ecr AS ecr,
                        d.bye AS bye,
                        d.sd as sd,
                        d.best as best,
                        d.worst as worst
                    FROM
                        draft_rankings d
                    WHERE
                        d.page_type = 'redraft-overall'
                    ORDER BY
                        d.ecr
                ) AS draft
            LEFT JOIN 
                (
                    SELECT
                        off.player_display_name AS player_name,
                        t.initials AS team,
                        off.headshot_url AS image_url,
                        SUM(off.fantasy_points_ppr) AS fpts_2023
                    FROM
                        offense_stats off
                        join teams t on t."teamID" = off.recent_team
                    WHERE
                        off.season = 2023 AND off.season_type = 'REG'
                    GROUP BY
                        off.player_display_name, t.initials, off.headshot_url
                ) AS offense_2023
            ON
                draft.player_name = offense_2023.player_name
            LEFT JOIN 
                (
                    SELECT
                        off.player_display_name AS player_name,
                        t.initials AS team,
                        off.headshot_url AS image_url,
                        SUM(off.fantasy_points_ppr) AS fpts_2024
                    FROM
                        offense_stats off
                        join teams t on t."teamID" = off.recent_team
                    WHERE
                        off.season = 2024 AND off.season_type = 'REG'
                    GROUP BY
                        off.player_display_name, t.initials, off.headshot_url
                ) AS offense_2024
            ON
                draft.player_name = offense_2024.player_name
            LEFT JOIN 
                (
                    SELECT
                        p.player_name AS player_name,
                        SUM(p.rushing_att) AS projected_rushing_attempts,
                        SUM(p.rushing_yds) AS projected_rushing_yds,
                        SUM(p.rushing_tds) AS projected_rushing_tds,
                        SUM(p.receiving_rec) AS projected_receiving_rec,
                        SUM(p.receiving_yds) AS projected_receiving_yds,
                        SUM(p.receiving_tds) AS projected_receiving_tds,
                        SUM(p.fpts) AS projected_fpts
                    FROM
                        draft_projections p
                    WHERE
                    p."Position" <> 'QB' AND p."Position" <> 'WR' AND p."Position" <> 'TE' AND "Position" <> 'FLEX' AND p."Position" <> 'DST' AND p."Position" <> 'K'
                    GROUP BY
                        p.player_name
                ) AS projections_2024
            ON
                draft.player_name = projections_2024.player_name
            WHERE
                draft.position = 'RB'
            ORDER BY
                draft.ecr;
        `);

        res.status(200).send(rows);
    } catch (error) {
        console.error("An error occurred while fetching the 'RB' draft rankings:", error);
        res.status(500).send("An error occurred while fetching the 'RB' draft rankings");
    } finally {
        await connection.end();
    }
});

router.get("/draft-rankings/wr", async (req, res) => {
    const connection = createConnection();

    try {
        const { rows } = await connection.query(
            `
            SELECT
                draft.player_id,
                draft.player_name,
                COALESCE(offense_2024.image_url, offense_2023.image_url) AS IMAGE_URL,
                draft.position,
                COALESCE(offense_2024.team, offense_2023.team) AS TEAM,
                draft.ecr,
                draft.bye,
                draft.sd,
                draft.best,
                draft.worst,
                projections_2024.projected_receiving_rec,
                projections_2024.projected_receiving_yds,
                projections_2024.projected_receiving_tds,
                projections_2024.projected_rushing_attempts,
                projections_2024.projected_rushing_yds,
                projections_2024.projected_rushing_tds,
                projections_2024.projected_fpts,
                COALESCE(offense_2024.fpts_2024, 0) AS fpts_2024,
                COALESCE(offense_2023.fpts_2023, 0) AS fpts_2023,
                (1000 - draft.ecr) * 1.6 + COALESCE(
                    offense_2023.fpts_2023, 
                    (LAG(offense_2023.fpts_2023) OVER (PARTITION BY draft.position ORDER BY draft.ecr) 
                    + LEAD(offense_2023.fpts_2023) OVER (PARTITION BY draft.position ORDER BY draft.ecr)) / 2
                ) * 0.09 AS elo
            FROM
                (
                    SELECT
                        d.id AS player_id,
                        d.player AS player_name,
                        d.pos AS position,
                        d.team AS team,
                        d.ecr AS ecr,
                        d.bye AS bye,
                        d.sd as sd,
                        d.best as best,
                        d.worst as worst
                    FROM
                        draft_rankings d
                    WHERE
                        d.page_type = 'redraft-overall'
                    ORDER BY
                        d.ecr
                ) AS draft
            LEFT JOIN 
                (
                    SELECT
                        off.player_display_name AS player_name,
                        t.initials AS team,
                        off.headshot_url AS image_url,
                        SUM(off.fantasy_points_ppr) AS fpts_2023
                    FROM
                        offense_stats off
                        join teams t on t."teamID" = off.recent_team
                    WHERE
                        off.season = 2023 AND off.season_type = 'REG'
                    GROUP BY
                        off.player_display_name, t.initials, off.headshot_url
                ) AS offense_2023
            ON
                draft.player_name = offense_2023.player_name
            LEFT JOIN 
                (
                    SELECT
                        off.player_display_name AS player_name,
                        t.initials AS team,
                        off.headshot_url AS image_url,
                        SUM(off.fantasy_points_ppr) AS fpts_2024
                    FROM
                        offense_stats off
                        join teams t on t."teamID" = off.recent_team
                    WHERE
                        off.season = 2024 AND off.season_type = 'REG'
                    GROUP BY
                        off.player_display_name, t.initials, off.headshot_url
                ) AS offense_2024
            ON
                draft.player_name = offense_2024.player_name
            LEFT JOIN 
                (
                    SELECT
                        p.player_name AS player_name,
                        SUM(p.receiving_rec) AS projected_receiving_rec,
                        SUM(p.receiving_yds) AS projected_receiving_yds,
                        SUM(p.receiving_tds) AS projected_receiving_tds,
                        SUM(p.rushing_att) AS projected_rushing_attempts,
                        SUM(p.rushing_yds) AS projected_rushing_yds,
                        SUM(p.rushing_tds) AS projected_rushing_tds,
                        SUM(p.fpts) AS projected_fpts
                    FROM
                        draft_projections p
                    WHERE
                    p."Position" <> 'QB' AND p."Position" <> 'RB' AND p."Position" <> 'TE' AND "Position" <> 'FLEX' AND p."Position" <> 'DST' AND p."Position" <> 'K'
                    GROUP BY
                        p.player_name
                ) AS projections_2024
            ON
                draft.player_name = projections_2024.player_name
            WHERE
                draft.position = 'WR'
            ORDER BY
                draft.ecr;
        `);

        res.status(200).send(rows);
    } catch (error) {
        console.error("An error occurred while fetching the 'WR' draft rankings:", error);
        res.status(500).send("An error occurred while fetching the 'WR' draft rankings");
    } finally {
        await connection.end();
    }
});

router.get("/draft-rankings/te", async (req, res) => {
    const connection = createConnection();

    try {
        const { rows } = await connection.query(
            `
            SELECT
                draft.player_id,
                draft.player_name,
                COALESCE(offense_2024.image_url, offense_2023.image_url) AS IMAGE_URL,
                draft.position,
                COALESCE(offense_2024.team, offense_2023.team) AS TEAM,
                draft.ecr,
                draft.bye,
                draft.sd,
                draft.best,
                draft.worst,
                projections_2024.projected_receiving_rec,
                projections_2024.projected_receiving_yds,
                projections_2024.projected_receiving_tds,
                projections_2024.projected_rushing_attempts,
                projections_2024.projected_rushing_yds,
                projections_2024.projected_rushing_tds,
                projections_2024.projected_fpts,
                COALESCE(offense_2024.fpts_2024, 0) AS fpts_2024,
                COALESCE(offense_2023.fpts_2023, 0) AS fpts_2023,
                (1000 - draft.ecr) * 1.6 + COALESCE(
                    offense_2023.fpts_2023, 
                    (LAG(offense_2023.fpts_2023) OVER (PARTITION BY draft.position ORDER BY draft.ecr) 
                    + LEAD(offense_2023.fpts_2023) OVER (PARTITION BY draft.position ORDER BY draft.ecr)) / 2
                ) * 0.09 AS elo
            FROM
                (
                    SELECT
                        d.id AS player_id,
                        d.player AS player_name,
                        d.pos AS position,
                        d.team AS team,
                        d.ecr AS ecr,
                        d.bye AS bye,
                        d.sd as sd,
                        d.best as best,
                        d.worst as worst
                    FROM
                        draft_rankings d
                    WHERE
                        d.page_type = 'redraft-overall'
                    ORDER BY
                        d.ecr
                ) AS draft
            LEFT JOIN 
                (
                    SELECT
                        off.player_display_name AS player_name,
                        t.initials AS team,
                        off.headshot_url AS image_url,
                        SUM(off.fantasy_points_ppr) AS fpts_2023
                    FROM
                        offense_stats off
                        join teams t on t."teamID" = off.recent_team
                    WHERE
                        off.season = 2023 AND off.season_type = 'REG'
                    GROUP BY
                        off.player_display_name, t.initials, off.headshot_url
                ) AS offense_2023
            ON
                draft.player_name = offense_2023.player_name
            LEFT JOIN 
                (
                    SELECT
                        off.player_display_name AS player_name,
                        t.initials AS team,
                        off.headshot_url AS image_url,
                        SUM(off.fantasy_points_ppr) AS fpts_2024
                    FROM
                        offense_stats off
                        join teams t on t."teamID" = off.recent_team
                    WHERE
                        off.season = 2024 AND off.season_type = 'REG'
                    GROUP BY
                        off.player_display_name, t.initials, off.headshot_url
                ) AS offense_2024
            ON
                draft.player_name = offense_2024.player_name
            LEFT JOIN 
                (
                    SELECT
                        p.player_name AS player_name,
                        SUM(p.receiving_rec) AS projected_receiving_rec,
                        SUM(p.receiving_yds) AS projected_receiving_yds,
                        SUM(p.receiving_tds) AS projected_receiving_tds,
                        SUM(p.rushing_att) AS projected_rushing_attempts,
                        SUM(p.rushing_yds) AS projected_rushing_yds,
                        SUM(p.rushing_tds) AS projected_rushing_tds,
                        SUM(p.fpts) AS projected_fpts
                    FROM
                        draft_projections p
                    WHERE
                    p."Position" <> 'QB' AND p."Position" <> 'RB' AND p."Position" <> 'WR' AND "Position" <> 'TE' AND p."Position" <> 'DST' AND p."Position" <> 'K'
                    GROUP BY
                        p.player_name
                ) AS projections_2024
            ON
                draft.player_name = projections_2024.player_name
            WHERE
                draft.position = 'TE'
            ORDER BY
                draft.ecr;
        `);

        res.status(200).send(rows);
    } catch (error) {
        console.error("An error occurred while fetching the 'TE' draft rankings:", error);
        res.status(500).send("An error occurred while fetching the 'TE' draft rankings");
    } finally {
        await connection.end();
    }
});

router.get("/draft-rankings/flex", async (req, res) => {
    const connection = createConnection();

    try {
        const { rows } = await connection.query(
            `
            SELECT
                draft.PLAYER_ID,
                draft.PLAYER_NAME,
                COALESCE(offense_2024.IMAGE_URL, offense_2023.IMAGE_URL) AS IMAGE_URL,
                draft.POSITION,
                COALESCE(offense_2024.TEAM, offense_2023.TEAM) AS TEAM,
                draft.ECR,
                draft.BYE,
                draft.SD,
                draft.BEST,
                draft.WORST,
                projections_2024.FNTSY_PROJ,
                COALESCE(offense_2024.FNTSY_2024, 0) AS FNTSY_2024,
                COALESCE(offense_2023.FNTSY_2023, 0) AS FNTSY_2023,
                CASE 
                    WHEN draft.POSITION = 'TE' THEN (1000 - draft.ECR) * 1.6 + COALESCE(
                        offense_2023.FNTSY_2023, 
                        (LAG(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR) + 
                        LEAD(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR)) / 2
                    ) * 0.1
                    WHEN draft.POSITION = 'RB' THEN (1000 - draft.ECR) * 1.6 + COALESCE(
                        offense_2023.FNTSY_2023, 
                        (LAG(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR) + 
                        LEAD(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR)) / 2
                    ) * 0.15
                    WHEN draft.POSITION = 'WR' THEN (1000 - draft.ECR) * 1.6 + COALESCE(
                        offense_2023.FNTSY_2023, 
                        (LAG(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR) + 
                        LEAD(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR)) / 2
                    ) * 0.1
                END AS ELO
            FROM
                (
                    SELECT
                        d.id AS PLAYER_ID,
                        d.player AS PLAYER_NAME,
                        d.pos AS POSITION,
                        d.team AS TEAM,
                        d.ecr AS ECR,
                        d.bye AS BYE,
                        d.sd as SD,
                        d.best as BEST,
                        d.worst as WORST
                    FROM
                        draft_rankings d
                    WHERE
                        d.page_type = 'redraft-overall'
                    ORDER BY
                        d.ecr
                ) AS draft
            LEFT JOIN 
                (
                    SELECT
                        off.player_display_name AS PLAYER_NAME,
                        t.initials AS TEAM,
                        off.headshot_url AS IMAGE_URL,
                        SUM(off.fantasy_points_ppr) AS FNTSY_2023
                    FROM
                        offense_stats off
                        join teams t on t."teamID" = off.recent_team
                    WHERE
                        off.season = 2023 AND off.season_type = 'REG'
                    GROUP BY
                        off.player_display_name, t.initials, off.headshot_url
                ) AS offense_2023
            ON
                draft.PLAYER_NAME = offense_2023.PLAYER_NAME
            LEFT JOIN 
                (
                    SELECT
                        off.player_display_name AS PLAYER_NAME,
                        t.initials AS TEAM,
                        off.headshot_url AS IMAGE_URL,
                        SUM(off.fantasy_points_ppr) AS FNTSY_2024
                    FROM
                        offense_stats off
                        join teams t on t."teamID" = off.recent_team
                    WHERE
                        off.season = 2024 AND off.season_type = 'REG'
                    GROUP BY
                        off.player_display_name, t.initials, off.headshot_url
                ) AS offense_2024
            ON
                draft.PLAYER_NAME = offense_2024.PLAYER_NAME
            LEFT JOIN 
                (
                    SELECT
                        p.player_name AS PLAYER_NAME,
                        SUM(p.fpts) AS FNTSY_PROJ
                    FROM
                        draft_projections p
                    WHERE
                        p."Position" <> 'QB' AND "Position" <> 'FLEX' AND p."Position" <> 'DST' AND p."Position" <> 'K'
                    GROUP BY
                        p.player_name
                ) AS projections_2024
            ON
                draft.PLAYER_NAME = projections_2024.PLAYER_NAME
            WHERE
                (draft.position = 'RB' OR draft.position = 'WR' OR draft.position = 'TE')
            ORDER BY
                draft.ECR;
        `);

        res.status(200).send(rows);
    } catch (error) {
        console.error("An error occurred while fetching 'FLEX' draft rankings:", error);
        res.status(500).send("An error occurred while fetching the 'FLEX' draft rankings");
    } finally {
        await connection.end();
    }
});

router.get("/draft-rankings/dst", async (req, res) => {
    const connection = createConnection();

    try {
        const { rows } = await connection.query(
            `
            SELECT
                draft.player_id,
                draft.player_name,
                defense_2024.team_name,
                COALESCE(defense_2024.image_url, defense_2023.image_url) AS image_url,
                draft.position,
                COALESCE(defense_2024.team, defense_2023.team) AS team,
                draft.ecr,
                draft.bye,
                draft.sd,
                draft.best,
                draft.worst,
                projections_2024.projected_sack,
                projections_2024.projected_int,
                projections_2024.projected_fr,
                projections_2024.projected_ff,
                projections_2024.projected_td,
                projections_2024.projected_safety,
                projections_2024.projected_pa,
                projections_2024.projected_yds_agn,
                projections_2024.projected_fpts,
                COALESCE(defense_2024.fpts_2024, 0) AS fpts_2024,
                COALESCE(defense_2023.fpts_2023, 0) AS fpts_2023,
                (1000 - draft.ecr) * 1.4 + COALESCE(
                        defense_2023.fpts_2023, 
                        (LAG(defense_2023.fpts_2023) OVER (PARTITION BY draft.position ORDER BY draft.ecr) + 
                        LEAD(defense_2023.fpts_2023) OVER (PARTITION BY draft.position ORDER BY draft.ecr)) / 2
                ) * 0.6 AS elo
            FROM
                (
                    SELECT
                        d.id AS player_id,
                        d.player AS player_name,
                        d.pos AS position,
                        d.team AS team,
                        d.ecr AS ecr,
                        d.bye AS bye,
                        d.sd as sd,
                        d.best as best,
                        d.worst as worst
                    FROM
                        draft_rankings d
                    WHERE
                        d.page_type = 'redraft-overall'
                    ORDER BY
                        d.ecr
                ) AS draft
            LEFT JOIN 
                (
                    SELECT
                        t.name AS team_name,
                        t.initials AS team,
                        t."imageURL" AS image_url,
                        SUM(
                            def.def_tackles * 1 +
                            def.def_tackles_for_loss * 2 +
                            def.def_sacks * 4 +
                            def.def_qb_hits * 1 +
                            def.def_interceptions * 6 +
                            def.def_tds * 6 +
                            def.def_pass_defended * 2 +
                            def.def_fumbles * 2 +
                            def.def_fumble_recovery_opp * 2 +
                            def.def_fumble_recovery_own * 2 +
                            def.def_fumbles_forced * 2 +
                            def.def_safety * 2
                        ) AS fpts_2023
                    FROM
                        defense_stats def
                        join teams t on t."teamID" = def.team
                    WHERE
                        def.season = 2023 AND def.season_type = 'REG'
                    GROUP BY
                        t.name, t.initials, t."imageURL"
                ) AS defense_2023
            ON
                draft.player_name = defense_2023.team_name
            LEFT JOIN 
                (
                    SELECT
                        t.name AS team_name,
                        t.initials AS team,
                        t."imageURL" AS image_url,
                        SUM(
                            def.def_tackles * 1 +
                            def.def_tackles_for_loss * 2 +
                            def.def_sacks * 4 +
                            def.def_qb_hits * 1 +
                            def.def_interceptions * 6 +
                            def.def_tds * 6 +
                            def.def_pass_defended * 2 +
                            def.def_fumbles * 2 +
                            def.def_fumble_recovery_opp * 2 +
                            def.def_fumble_recovery_own * 2 +
                            def.def_fumbles_forced * 2 +
                            def.def_safety * 2
                        ) AS fpts_2024
                    FROM
                        defense_stats def
                        join teams t on t."teamID" = def.team
                    WHERE
                        def.season = 2024 AND def.season_type = 'REG'
                    GROUP BY
                        t.name, t.initials, t."imageURL"
                ) AS defense_2024
            ON
                draft.player_name = defense_2024.team_name
            LEFT JOIN 
                (
                    SELECT
                        p.player_name AS player_name,
                        SUM(p.sack) AS projected_sack,
                        SUM(p.int) AS projected_int,
                        SUM(p.fr) AS projected_fr,
                        SUM(p.ff) AS projected_ff,
                        SUM(p.td) AS projected_td,
                        SUM(p.safety) AS projected_safety,
                        SUM(p.pa) AS projected_pa,
                        SUM(p.yds_agn) AS projected_yds_agn,
                        SUM(p.fpts) AS projected_fpts
                    FROM
                        draft_projections p
                    WHERE
                        p."Position" <> 'QB' and p."Position" <> 'RB' and p."Position" <> 'WR' and p."Position" <> 'TE' and "Position" <> 'FLEX' and p."Position" <> 'K'
                    GROUP BY
                        p.player_name
                ) AS projections_2024
            ON
                draft.player_name = projections_2024.player_name
            WHERE
                (draft.position = 'DST')
            ORDER BY
                draft.ecr;
        `);

        res.status(200).send(rows);
    } catch (error) {
        console.error("An error occurred while fetching the 'DST' draft rankings:", error);
        res.status(500).send("An error occurred while fetching the 'DST' draft rankings");
    } finally {
        await connection.end();
    }
});

router.get("/draft-rankings/k", async (req, res) => {
    const connection = createConnection();

    try {
        const { rows } = await connection.query(
            `
            SELECT
                draft.player_id,
                draft.player_name,
                COALESCE(kicking_2024.image_url, kicking_2023.image_url) AS image_url,
                draft.position,
                COALESCE(kicking_2024.team, kicking_2023.team) AS team,
                draft.ecr,
                draft.bye,
                draft.sd,
                draft.best,
                draft.worst,
                projections_2024.projected_fg,
                projections_2024.projected_fga,
                projections_2024.projected_xpt,
                projections_2024.projected_fpts,
                COALESCE(kicking_2024.fpts_2024, 0) AS fpts_2024,
                COALESCE(kicking_2023.fpts_2023, 0) AS fpts_2023,
                (1000 - draft.ecr) * 1.4 + COALESCE(
                        kicking_2023.fpts_2023, 
                        (LAG(kicking_2023.fpts_2023) OVER (PARTITION BY draft.position ORDER BY draft.ecr) + 
                        LEAD(kicking_2023.fpts_2023) OVER (PARTITION BY draft.position ORDER BY draft.ecr)) / 2
                ) * 0.6 AS elo
            FROM
                (
                    SELECT
                        d.id AS player_id,
                        d.player AS player_name,
                        d.pos AS position,
                        d.team AS team,
                        d.ecr AS ecr,
                        d.bye AS bye,
                        d.sd as sd,
                        d.best as best,
                        d.worst as worst
                    FROM
                        draft_rankings d
                    WHERE
                        d.page_type = 'redraft-overall'
                    ORDER BY
                        d.ecr
                ) AS draft
            LEFT JOIN 
                (
                    SELECT
                        k.player_display_name AS player_name,
                        t.initials AS team,
                        k.headshot_url AS image_url,
                        SUM(k.fg_made * 3 +
                            k.fg_made_50_59 +
                            k.fg_made_60_ +
                            k.pat_made
                        ) AS fpts_2023
                    FROM
                        kicking_stats k
                        join teams t on t."teamID" = k.team
                    WHERE
                        k.season = 2023 AND k.season_type = 'REG'
                    GROUP BY
                        k.player_display_name, t.initials, k.headshot_url
                ) AS kicking_2023
            ON
                draft.player_name = kicking_2023.player_name
            LEFT JOIN 
                (
                    SELECT
                        k.player_display_name AS player_name,
                        t.initials AS team,
                        k.headshot_url AS image_url,
                        SUM(k.fg_made * 3 +
                            k.fg_made_50_59 +
                            k.fg_made_60_ +
                            k.pat_made
                        ) AS fpts_2024
                    FROM
                        kicking_stats k
                        join teams t on t."teamID" = k.team
                    WHERE
                        k.season = 2024 AND k.season_type = 'REG'
                    GROUP BY
                        k.player_display_name, t.initials, k.headshot_url
                ) AS kicking_2024
            ON
                draft.player_name = kicking_2024.player_name
            LEFT JOIN 
                (
                    SELECT
                        p.player_name AS player_name,
                        SUM(p.fg) AS projected_fg,
                        SUM(p.fga) AS projected_fga,
                        SUM(p.xpt) AS projected_xpt,
                        SUM(p.fpts) AS projected_fpts
                    FROM
                        draft_projections p
                    WHERE
                        p."Position" <> 'QB' or p."Position" <> 'RB' or p."Position" <> 'WR' or p."Position" <> 'TE' or "Position" <> 'FLEX' or p."Position" <> 'DST'
                    GROUP BY
                        p.player_name
                ) AS projections_2024
            ON
                draft.player_name = projections_2024.player_name
            WHERE
                (draft.position = 'K')
            ORDER BY
                draft.ecr;
        `);

        res.status(200).send(rows);
    } catch (error) {
        console.error("An error occurred while fetching the 'K' draft rankings:", error);
        res.status(500).send("An error occurred while fetching the top 'K' draft rankings");
    } finally {
        await connection.end();
    }
});

module.exports = router;