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
                p.player_name as player_name,
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
                p.player_name,
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

module.exports = router;