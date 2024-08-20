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

router.get("/top-players/qb", async (req, res) => {
    const connection = createConnection();

    const { sort = 'FPTS', order = 'desc', year = 2023, scoring = 'PPR' } = req.query;

    const pointsColumn = scoring === 'Standard' ? 'fantasy_points' : 'fantasy_points_ppr';

    try {
        const { rows } = await connection.query(
            `
            select
                player_name,
                position,
                headshot_url,
                recent_team,
                sum(completions) as COMP,
                sum(attempts) as ATT,
                sum(passing_yards) as PASS_YDS,
                sum(passing_tds) as PASS_TD,
                sum(interceptions) as INT,
                sum(carries) as CAR,
                sum(rushing_yards) as RUSH_YDS,
                sum(rushing_tds) as RUSH_TD,
                round(sum(${pointsColumn})::numeric, 2) as FPTS
            from
                players
            where
                position = 'QB'
                and season = $1
                and season_type = 'REG'
            group by
                player_name,
                position,
                headshot_url,
                recent_team
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

    const { sort = 'FPTS', order = 'desc', year = 2023, scoring = 'PPR' } = req.query;

    const pointsColumn = scoring === 'Standard' ? 'fantasy_points' : 'fantasy_points_ppr';

    try {
        const { rows } = await connection.query(
            `
            select
                player_name,
                position,
                headshot_url,
                recent_team,
                sum(receptions) as REC,
                sum(targets) as TAR,
                sum(receiving_yards) as REC_YDS,
                sum(receiving_tds) as REC_TD,
                sum(carries) as CAR,
                sum(rushing_yards) as RUSH_YDS,
                sum(rushing_tds) as RUSH_TD,
                round(sum(${pointsColumn})::numeric, 2) as FPTS
            from
                players
            where
                position = 'WR'
                and season = $1
                and season_type = 'REG'
            group by
                player_name,
                position,
                headshot_url,
                recent_team
            order by 
                ${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
            `, [year]
        );

        res.status(200).send(rows);
        await connection.end();
    } catch (error) {
        console.error("An error occurred while fetching the top WRs:", error);
        res.status(500).send("An error occurred while fetching the top WRs");
    }
});

router.get("/top-players/rb", async (req, res) => {

    const connection = createConnection();

    const { sort = 'FPTS', order = 'desc', year = 2023, scoring = 'PPR' } = req.query;

    const pointsColumn = scoring === 'Standard' ? 'fantasy_points' : 'fantasy_points_ppr';

    try {
        const { rows } = await connection.query(
            `
            select
                player_name,
                position,
                headshot_url,
                recent_team,
                sum(carries) as CAR,
                sum(rushing_yards) as RUSH_YDS,
                round(avg(rushing_yards)::numeric, 2) as AVG_RUSH_YDS,
                sum(rushing_tds) as RUSH_TD,
                sum(receptions) as REC,
                sum(receiving_yards) as REC_YDS,
                round(avg(receiving_yards)::numeric, 2) as AVG_REC_YDS,
                sum(receiving_tds) as REC_TD,
                round(sum(${pointsColumn})::numeric, 2) as FPTS
            from
                players
            where
                (position = 'RB' or position = 'FB')
                and season = $1
                and season_type = 'REG'
            group by
                player_name,
                position,
                headshot_url,
                recent_team
            order by 
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

router.get("/top-players/te", async (req, res) => {

    const connection = createConnection();

    const { sort = 'FPTS', order = 'desc', year = 2023, scoring = 'PPR' } = req.query;

    const pointsColumn = scoring === 'Standard' ? 'fantasy_points' : 'fantasy_points_ppr';

    try {
        const { rows } = await connection.query(
            `
            select
                player_name,
                position,
                headshot_url,
                recent_team,
                sum(receptions) as REC,
                sum(targets) as TAR,
                sum(receiving_yards) as REC_YDS,
                sum(receiving_tds) as REC_TD,
                sum(carries) as CAR,
                sum(rushing_yards) as RUSH_YDS,
                sum(rushing_tds) as RUSH_TD,
                round(sum(${pointsColumn})::numeric, 2) as FPTS
            from
                players
            where
                position = 'TE'
                and season = $1
                and season_type = 'REG'
            group by
                player_name,
                position,
                headshot_url,
                recent_team
            order by 
                ${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
            `, [year]
        );

        res.status(200).send(rows);
        await connection.end();
    } catch (error) {
        console.error("An error occurred while fetching the top tes:", error);
        res.status(500).send("An error occurred while fetching the top tes");
    }
});

module.exports = router;