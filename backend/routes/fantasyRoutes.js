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
                (1000 - draft.ECR) * 1.6 + COALESCE(
                    offense_2023.FNTSY_2023, 
                    (LAG(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR) 
                    + LEAD(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR)) / 2
                ) * 0.09 AS ELO
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
                    p."Position" <> 'RB' AND p."Position" <> 'WR' AND p."Position" <> 'TE' AND "Position" <> 'FLEX' AND p."Position" <> 'DST' AND p."Position" <> 'K'
                    GROUP BY
                        p.player_name
                ) AS projections_2024
            ON
                draft.PLAYER_NAME = projections_2024.PLAYER_NAME
            WHERE
                draft.position = 'QB'
            ORDER BY
                draft.ECR;
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
                (1000 - draft.ECR) * 1.6 + COALESCE(
                        offense_2023.FNTSY_2023, 
                        (LAG(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR) + 
                        LEAD(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR)) / 2
                    ) * 0.15 AS ELO
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
                        p."Position" <> 'QB' AND p."Position" <> 'WR' AND p."Position" <> 'TE' AND "Position" <> 'FLEX' AND p."Position" <> 'DST' AND p."Position" <> 'K'
                    GROUP BY
                        p.player_name
                ) AS projections_2024
            ON
                draft.PLAYER_NAME = projections_2024.PLAYER_NAME
            WHERE
                draft.position = 'RB'
            ORDER BY
                draft.ECR;
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
                (1000 - draft.ECR) * 1.6 + COALESCE(
                        offense_2023.FNTSY_2023, 
                        (LAG(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR) + 
                        LEAD(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR)) / 2
                ) * 0.1 AS ELO
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
                    p."Position" <> 'QB' AND p."Position" <> 'RB' AND p."Position" <> 'TE' AND "Position" <> 'FLEX' AND p."Position" <> 'DST' AND p."Position" <> 'K'
                    GROUP BY
                        p.player_name
                ) AS projections_2024
            ON
                draft.PLAYER_NAME = projections_2024.PLAYER_NAME
            WHERE
                draft.position = 'WR'
            ORDER BY
                draft.ECR;
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
                (1000 - draft.ECR) * 1.6 + COALESCE(
                        offense_2023.FNTSY_2023, 
                        (LAG(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR) + 
                        LEAD(offense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR)) / 2
                ) * 0.1 AS ELO
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
                        p."Position" <> 'QB' AND p."Position" <> 'RB' AND p."Position" <> 'WR' AND "Position" <> 'FLEX' AND p."Position" <> 'DST' AND p."Position" <> 'K'
                    GROUP BY
                        p.player_name
                ) AS projections_2024
            ON
                draft.PLAYER_NAME = projections_2024.PLAYER_NAME
            WHERE
                draft.position = 'TE'
            ORDER BY
                draft.ECR;
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
                draft.PLAYER_ID,
                draft.PLAYER_NAME,
                defense_2024.TEAM_NAME,
                defense_2023.TEAM_NAME as TEAM_NAME2,
                COALESCE(defense_2024.IMAGE_URL, defense_2023.IMAGE_URL) AS IMAGE_URL,
                draft.POSITION,
                COALESCE(defense_2024.TEAM, defense_2023.TEAM) AS TEAM,
                draft.ECR,
                draft.BYE,
                draft.SD,
                draft.BEST,
                draft.WORST,
                projections_2024.FNTSY_PROJ,
                COALESCE(defense_2024.FNTSY_2024, 0) AS FNTSY_2024,
                COALESCE(defense_2023.FNTSY_2023, 0) AS FNTSY_2023,
                (1000 - draft.ECR) * 1.4 + COALESCE(
                        defense_2023.FNTSY_2023, 
                        (LAG(defense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR) + 
                        LEAD(defense_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR)) / 2
                ) * 0.6 AS ELO
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
                        t.name AS TEAM_NAME,
                        t.initials AS TEAM,
                        t."imageURL" AS IMAGE_URL,
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
                        ) AS FNTSY_2023
                    FROM
                        defense_stats def
                        join teams t on t."teamID" = def.team
                    WHERE
                        def.season = 2023 AND def.season_type = 'REG'
                    GROUP BY
                        t.name, t.initials, t."imageURL"
                ) AS defense_2023
            ON
                draft.PLAYER_NAME = defense_2023.TEAM_NAME
            LEFT JOIN 
                (
                    SELECT
                        t.name AS TEAM_NAME,
                        t.initials AS TEAM,
                        t."imageURL" AS IMAGE_URL,
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
                        ) AS FNTSY_2024
                    FROM
                        defense_stats def
                        join teams t on t."teamID" = def.team
                    WHERE
                        def.season = 2024 AND def.season_type = 'REG'
                    GROUP BY
                        t.name, t.initials, t."imageURL"
                ) AS defense_2024
            ON
                draft.PLAYER_NAME = defense_2024.TEAM_NAME
            LEFT JOIN 
                (
                    SELECT
                        p.player_name AS PLAYER_NAME,
                        SUM(p.fpts) AS FNTSY_PROJ
                    FROM
                        draft_projections p
                    WHERE
                        p."Position" <> 'QB' and p."Position" <> 'RB' and p."Position" <> 'WR' and p."Position" <> 'TE' and "Position" <> 'FLEX' and p."Position" <> 'K'
                    GROUP BY
                        p.player_name
                ) AS projections_2024
            ON
                draft.PLAYER_NAME = projections_2024.PLAYER_NAME
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
                draft.PLAYER_ID,
                draft.PLAYER_NAME,
                COALESCE(kicking_2024.IMAGE_URL, kicking_2023.IMAGE_URL) AS IMAGE_URL,
                draft.POSITION,
                COALESCE(kicking_2024.TEAM, kicking_2023.TEAM) AS TEAM,
                draft.ECR,
                draft.BYE,
                draft.SD,
                draft.BEST,
                draft.WORST,
                projections_2024.FNTSY_PROJ,
                COALESCE(kicking_2024.FNTSY_2024, 0) AS FNTSY_2024,
                COALESCE(kicking_2023.FNTSY_2023, 0) AS FNTSY_2023,
                (1000 - draft.ECR) * 1.4 + COALESCE(
                        kicking_2023.FNTSY_2023, 
                        (LAG(kicking_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR) + 
                        LEAD(kicking_2023.FNTSY_2023) OVER (PARTITION BY draft.POSITION ORDER BY draft.ECR)) / 2
                ) * 0.6 AS ELO
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
                        k.player_display_name AS PLAYER_NAME,
                        t.initials AS TEAM,
                        k.headshot_url AS IMAGE_URL,
                        SUM(k.fg_made * 3 +
                            k.fg_made_50_59 +
                            k.fg_made_60_ +
                            k.pat_made
                        ) AS FNTSY_2023
                    FROM
                        kicking_stats k
                        join teams t on t."teamID" = k.team
                    WHERE
                        k.season = 2023 AND k.season_type = 'REG'
                    GROUP BY
                        k.player_display_name, t.initials, k.headshot_url
                ) AS kicking_2023
            ON
                draft.PLAYER_NAME = kicking_2023.PLAYER_NAME
            LEFT JOIN 
                (
                    SELECT
                        k.player_display_name AS PLAYER_NAME,
                        t.initials AS TEAM,
                        k.headshot_url AS IMAGE_URL,
                        SUM(k.fg_made * 3 +
                            k.fg_made_50_59 +
                            k.fg_made_60_ +
                            k.pat_made
                        ) AS FNTSY_2024
                    FROM
                        kicking_stats k
                        join teams t on t."teamID" = k.team
                    WHERE
                        k.season = 2024 AND k.season_type = 'REG'
                    GROUP BY
                        k.player_display_name, t.initials, k.headshot_url
                ) AS kicking_2024
            ON
                draft.PLAYER_NAME = kicking_2024.PLAYER_NAME
            LEFT JOIN 
                (
                    SELECT
                        p.player_name AS PLAYER_NAME,
                        SUM(p.fpts) AS FNTSY_PROJ
                    FROM
                        draft_projections p
                    WHERE
                        p."Position" <> 'QB' or p."Position" <> 'RB' or p."Position" <> 'WR' or p."Position" <> 'TE' or "Position" <> 'FLEX' or p."Position" <> 'DST'
                    GROUP BY
                        p.player_name
                ) AS projections_2024
            ON
                draft.PLAYER_NAME = projections_2024.PLAYER_NAME
            WHERE
                (draft.position = 'K')
            ORDER BY
                draft.ECR;
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