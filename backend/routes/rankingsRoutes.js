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

router.get("/top-players/all", async (req, res) => {
    const connection = createConnection();

    const { sort = 'FNTSY_FPTS', order = 'desc', year = 2023, scoring = 'PPR' } = req.query;

    const pointsColumn = scoring === 'Standard' ? 'fantasy_points' : 'fantasy_points_ppr';

    try {
        const { rows } = await connection.query(
            `
            select
                p.player_display_name as player_name,
                p.position as position,
                p.headshot_url as headshot_url,
                t.initials as team_initials,
                sum(p.completions) AS PASS_COMP,
                sum(p.attempts) AS PASS_ATT,
                sum(p.passing_yards) as PASS_YDS,
                sum(p.passing_tds) as PASS_TD,
                sum(p.interceptions) as PASS_INT,
                sum(p.carries) as RUSH_CAR,
                sum(p.rushing_yards) as RUSH_YDS,
                sum(p.rushing_tds) as RUSH_TD,
                sum(p.rushing_fumbles + p.receiving_fumbles + p.sack_fumbles) as RUSH_FUM,
                sum(receptions) as REC_REC,
                sum(p.targets) as REC_TAR,
                sum(p.receiving_yards) as REC_YDS,
                sum(p.receiving_tds) as REC_TD,
                round(sum(${pointsColumn})::numeric, 1) as FNTSY_FPTS
            from
                offense_stats p
                join teams t on p.recent_team = t."teamID"
            where
                (p.position = 'QB' or p.position = 'WR' or p.position = 'RB' or p.position = 'TE')
                and p.season = $1
                and p.season_type = 'REG'
            group by
                p.player_display_name,
                p.position,
                p.headshot_url,
                t.initials
            order by
                ${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
            `, [year]
        );

        res.status(200).send(rows);
    } catch (error) {
        console.error("An error occurred while fetching the top QBs:", error);
        res.status(500).send("An error occurred while fetching the top QBs");
    } finally {
        await connection.end();
    }
});

router.get("/top-players/qb", async (req, res) => {
    const connection = createConnection();

    const { sort = 'FNTSY_FPTS', order = 'desc', year = 2023, scoring = 'PPR' } = req.query;

    const pointsColumn = scoring === 'Standard' ? 'fantasy_points' : 'fantasy_points_ppr';

    try {
        const { rows } = await connection.query(
            `
            select
                p.player_display_name as player_name,
                p.position as position,
                p.headshot_url as headshot_url,
                t.initials as team_initials,
                sum(p.completions) AS PASS_COMP,
                sum(p.attempts) AS PASS_ATT,
                sum(p.passing_yards) as PASS_YDS,
                sum(p.passing_tds) as PASS_TD,
                sum(p.interceptions) as PASS_INT,
                sum(p.carries) as RUSH_CAR,
                sum(p.rushing_yards) as RUSH_YDS,
                sum(p.rushing_tds) as RUSH_TD,
                sum(p.rushing_fumbles + p.receiving_fumbles + p.sack_fumbles) as RUSH_FUM,
                sum(receptions) as REC_REC,
                sum(p.targets) as REC_TAR,
                sum(p.receiving_yards) as REC_YDS,
                sum(p.receiving_tds) as REC_TD,
                round(sum(${pointsColumn})::numeric, 1) as FNTSY_FPTS
            from
                offense_stats p
                join teams t on p.recent_team = t."teamID"
            where
                (p.position = 'QB')
                and p.season = $1
                and p.season_type = 'REG'
            group by
                p.player_display_name,
                p.position,
                p.headshot_url,
                t.initials
            order by
                ${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
            `, [year]
        );

        res.status(200).send(rows);
    } catch (error) {
        console.error("An error occurred while fetching the top QBs:", error);
        res.status(500).send("An error occurred while fetching the top QBs");
    } finally {
        await connection.end();
    }
});

router.get("/top-players/wr", async (req, res) => {
    const connection = createConnection();

    const { sort = 'FNTSY_FPTS', order = 'desc', year = 2023, scoring = 'PPR' } = req.query;

    const pointsColumn = scoring === 'Standard' ? 'fantasy_points' : 'fantasy_points_ppr';

    try {
        const { rows } = await connection.query(
            `
            select
                p.player_display_name as player_name,
                p.position as position,
                p.headshot_url as headshot_url,
                t.initials as team_initials,
                sum(p.completions) AS PASS_COMP,
                sum(p.attempts) AS PASS_ATT,
                sum(p.passing_yards) as PASS_YDS,
                sum(p.passing_tds) as PASS_TD,
                sum(p.interceptions) as PASS_INT,
                sum(p.carries) as RUSH_CAR,
                sum(p.rushing_yards) as RUSH_YDS,
                sum(p.rushing_tds) as RUSH_TD,
                sum(p.rushing_fumbles + p.receiving_fumbles + p.sack_fumbles) as RUSH_FUM,
                sum(receptions) as REC_REC,
                sum(p.targets) as REC_TAR,
                sum(p.receiving_yards) as REC_YDS,
                sum(p.receiving_tds) as REC_TD,
                round(sum(${pointsColumn})::numeric, 1) as FNTSY_FPTS
            from
                offense_stats p
                join teams t on p.recent_team = t."teamID"
            where
                (p.position = 'WR')
                and p.season = $1
                and p.season_type = 'REG'
            group by
                p.player_display_name,
                p.position,
                p.headshot_url,
                t.initials
            order by
                ${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
            `, [year]
        );

        res.status(200).send(rows);
    } catch (error) {
        console.error("An error occurred while fetching the top QBs:", error);
        res.status(500).send("An error occurred while fetching the top QBs");
    } finally {
        await connection.end();
    }
});

router.get("/top-players/rb", async (req, res) => {
    const connection = createConnection();

    const { sort = 'FNTSY_FPTS', order = 'desc', year = 2023, scoring = 'PPR' } = req.query;

    const pointsColumn = scoring === 'Standard' ? 'fantasy_points' : 'fantasy_points_ppr';

    try {
        const { rows } = await connection.query(
            `
            select
                p.player_display_name as player_name,
                p.position as position,
                p.headshot_url as headshot_url,
                t.initials as team_initials,
                sum(p.completions) AS PASS_COMP,
                sum(p.attempts) AS PASS_ATT,
                sum(p.passing_yards) as PASS_YDS,
                sum(p.passing_tds) as PASS_TD,
                sum(p.interceptions) as PASS_INT,
                sum(p.carries) as RUSH_CAR,
                sum(p.rushing_yards) as RUSH_YDS,
                sum(p.rushing_tds) as RUSH_TD,
                sum(p.rushing_fumbles + p.receiving_fumbles + p.sack_fumbles) as RUSH_FUM,
                sum(receptions) as REC_REC,
                sum(p.targets) as REC_TAR,
                sum(p.receiving_yards) as REC_YDS,
                sum(p.receiving_tds) as REC_TD,
                round(sum(${pointsColumn})::numeric, 1) as FNTSY_FPTS
            from
                offense_stats p
                join teams t on p.recent_team = t."teamID"
            where
                (p.position = 'RB')
                and p.season = $1
                and p.season_type = 'REG'
            group by
                p.player_display_name,
                p.position,
                p.headshot_url,
                t.initials
            order by
                ${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
            `, [year]
        );

        res.status(200).send(rows);
    } catch (error) {
        console.error("An error occurred while fetching the top QBs:", error);
        res.status(500).send("An error occurred while fetching the top QBs");
    } finally {
        await connection.end();
    }
});

router.get("/top-players/te", async (req, res) => {
    const connection = createConnection();

    const { sort = 'FNTSY_FPTS', order = 'desc', year = 2023, scoring = 'PPR' } = req.query;

    const pointsColumn = scoring === 'Standard' ? 'fantasy_points' : 'fantasy_points_ppr';

    try {
        const { rows } = await connection.query(
            `
            select
                p.player_display_name as player_name,
                p.position as position,
                p.headshot_url as headshot_url,
                t.initials as team_initials,
                sum(p.completions) AS PASS_COMP,
                sum(p.attempts) AS PASS_ATT,
                sum(p.passing_yards) as PASS_YDS,
                sum(p.passing_tds) as PASS_TD,
                sum(p.interceptions) as PASS_INT,
                sum(p.carries) as RUSH_CAR,
                sum(p.rushing_yards) as RUSH_YDS,
                sum(p.rushing_tds) as RUSH_TD,
                sum(p.rushing_fumbles + p.receiving_fumbles + p.sack_fumbles) as RUSH_FUM,
                sum(receptions) as REC_REC,
                sum(p.targets) as REC_TAR,
                sum(p.receiving_yards) as REC_YDS,
                sum(p.receiving_tds) as REC_TD,
                round(sum(${pointsColumn})::numeric, 1) as FNTSY_FPTS
            from
                offense_stats p
                join teams t on p.recent_team = t."teamID"
            where
                (p.position = 'TE')
                and p.season = $1
                and p.season_type = 'REG'
            group by
                p.player_display_name,
                p.position,
                p.headshot_url,
                t.initials
            order by
                ${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
            `, [year]
        );

        res.status(200).send(rows);
    } catch (error) {
        console.error("An error occurred while fetching the top QBs:", error);
        res.status(500).send("An error occurred while fetching the top QBs");
    } finally {
        await connection.end();
    }
});

router.get("/top-teams/offense", async (req, res) => {

    const connection = createConnection();

    const { sort = 'FNTSY_FPTS', order = 'desc', year = 2023, scoring = 'PPR' } = req.query;

    const pointsColumn = scoring === 'Standard' ? 'fantasy_points' : 'fantasy_points_ppr';

    try {
        const { rows } = await connection.query(
            `
            SELECT 
                t."teamID" as TEAM_ID,
                t.name as NAME,
                t."imageURL" AS IMAGE_URL,
                sum(p.completions) AS PASS_COMP,
                sum(p.attempts) AS PASS_ATT,
                sum(p.passing_yards) as PASS_YDS,
                sum(p.passing_tds) as PASS_TD,
                sum(p.interceptions) as PASS_INT,
                sum(p.carries) as RUSH_CAR,
                sum(p.rushing_yards) as RUSH_YDS,
                sum(p.rushing_tds) as RUSH_TD,
                sum(p.rushing_fumbles + p.receiving_fumbles + p.sack_fumbles) as RUSH_FUM,
                sum(receptions) as REC_REC,
                sum(p.targets) as REC_TAR,
                sum(p.receiving_yards) as REC_YDS,
                sum(p.receiving_tds) as REC_TD,
                round(sum(${pointsColumn})::numeric, 1) as FNTSY_FPTS
            FROM
                offense_stats p
                join teams t on p.recent_team = t."teamID"
            WHERE 
                p.season = $1
                and p.season_type = 'REG'
            GROUP BY 
                t."teamID", t.name
            ORDER BY 
                ${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
                `, [year]
            );
        res.status(200).send(rows);
        await connection.end();
    } catch (error) {
        console.error("An error occurred while fetching the top rbs:", error);
        res.status(500).send("An error occurred while fetching the top rbs");
    }
});

router.get("/top-teams/defense", async (req, res) => {
    const connection = createConnection();

    const { sort = 'DEF_FPTS', order = 'desc', year = 2023, scoring = 'PPR' } = req.query;

    const pointsColumn = scoring === 'Standard' ? 'fantasy_points' : 'fantasy_points_ppr';

    try {
        const { rows } = await connection.query(`
            SELECT 
                final_stats.TEAM_ID,
                final_stats.NAME,
                final_stats.IMAGE_URL,
                SUM(final_stats.DEF_FPTS) AS DEF_FPTS,
                ROUND((SUM(final_stats.DEF_FPTS)/17)::numeric, 1) AS DEF_AVG_FPTS,
                SUM(final_stats.DEF_TD) AS DEF_TD,
                SUM(final_stats.DEF_INT) AS DEF_INT,
                SUM(final_stats.DEF_SCK) AS DEF_SCK,
                SUM(final_stats.DEF_QB_HITS) AS DEF_QB_HITS,
                SUM(final_stats.DEF_FR) AS DEF_FR,
                SUM(final_stats.DEF_SFTY) AS DEF_SFTY,
                SUM(final_stats.DEF_TCKL) AS DEF_TCKL,
                SUM(final_stats.OPP_FPTS) AS OPP_FPTS,
                ROUND((SUM(final_stats.OPP_FPTS)/17)::numeric, 1) AS OPP_AVG_FPTS,
                SUM(final_stats.OPP_TD) AS OPP_TD,
                SUM(final_stats.OPP_PA) AS OPP_PA,
                SUM(final_stats.OPP_RUSHYA + final_stats.OPP_RECYA) AS OPP_YA
            FROM (
                SELECT 
                    def_stats.TEAM_ID,
                    def_stats.NAME,
                    def_stats.IMAGE_URL,
                    def_stats.WEEK,
                    def_stats.DEF_TD,
                    def_stats.DEF_INT,
                    def_stats.DEF_SCK,
                    def_stats.DEF_QB_HITS,
                    def_stats.DEF_FR,
                    def_stats.DEF_SFTY,
                    def_stats.DEF_TCKL,
                    def_stats.DEF_FPTS +
                        CASE
                            WHEN off_stats.OPP_POINTS = 0 THEN 10
                            WHEN off_stats.OPP_POINTS BETWEEN 1 AND 6 THEN 7
                            WHEN off_stats.OPP_POINTS BETWEEN 7 AND 13 THEN 4
                            WHEN off_stats.OPP_POINTS BETWEEN 14 AND 17 THEN 1
                            WHEN off_stats.OPP_POINTS BETWEEN 28 AND 34 THEN -1
                            WHEN off_stats.OPP_POINTS >= 35 THEN -4
                            ELSE 0
                        END AS DEF_FPTS,
                    off_stats.OPP_FPTS,
                    off_stats.OPP_TD,
                    off_stats.OPP_PA,
                    off_stats.OPP_PASSYA,
                    off_stats.OPP_RUSHYA,
                    off_stats.OPP_RECYA
                FROM 
                    (SELECT 
                        def.team AS TEAM_ID,
                        te.name AS NAME,
                        te."imageURL" AS IMAGE_URL,
                        def.week AS WEEK,
                        SUM(def.def_tds) AS DEF_TD,
                        SUM(def.def_interceptions) AS DEF_INT,
                        SUM(def.def_sacks) AS DEF_SCK,
                        SUM(def.def_qb_hits) AS DEF_QB_HITS,
                        SUM(def.def_fumble_recovery_opp + def.def_fumble_recovery_own) AS DEF_FR,
                        SUM(def.def_safety) AS DEF_SFTY,
                        SUM(def.def_tackles) AS DEF_TCKL,
                        SUM(
                            def.def_sacks * 1 +
                            def.def_interceptions * 2 +
                            def.def_fumble_recovery_opp * 2 +
                            def.def_tds * 6 +
                            def.def_safety * 2
                        ) AS DEF_FPTS
                    FROM
                        defense_stats def
                        JOIN teams te ON te."teamID" = def.team
                    WHERE 
                        def.season = $1
                        AND def.season_type = 'REG'
                    GROUP BY
                        def.team, def.week, te.name, te."imageURL"
                    ) as def_stats
                JOIN 
                    (SELECT 
                        off.opponent_team AS TEAM_ID,
                        off.week AS WEEK,
                        SUM(off.attempts) AS OPP_PA,
                        SUM(off.passing_yards) AS OPP_PASSYA,
                        SUM(off.rushing_yards) AS OPP_RUSHYA,
                        SUM(off.receiving_yards) AS OPP_RECYA,
                        SUM(off.rushing_tds + off.receiving_tds + off.special_teams_tds) AS OPP_TD,
                        SUM(off.rushing_tds + off.receiving_tds) * 7 + SUM(off.rushing_2pt_conversions + off.receiving_2pt_conversions) * 2 as OPP_POINTS,
                        ROUND(SUM(off.${pointsColumn})::numeric, 1) AS OPP_FPTS
                    FROM
                        offense_stats off
                        JOIN teams te ON te."teamID" = off.opponent_team
                    WHERE 
                        off.season = $1
                        AND off.season_type = 'REG'
                    GROUP BY
                        off.opponent_team, off.week
                    ) as off_stats
                ON def_stats.TEAM_ID = off_stats.TEAM_ID AND def_stats.WEEK = off_stats.WEEK
            ) AS final_stats
            GROUP BY
                final_stats.TEAM_ID, final_stats.NAME, final_stats.IMAGE_URL
            ORDER BY 
            ${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
        `, [year]);

        res.status(200).json(rows);
    } catch (error) {
        console.error("An error occurred while fetching the top defensive teams:", error);
        res.status(500).send("An error occurred while fetching the top defensive teams");
    } finally {
        await connection.end();
    }
});

module.exports = router;