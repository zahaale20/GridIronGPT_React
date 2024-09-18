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

router.get("/trade-analyze", async (req, res) => {
    const connection = createConnection();

    try {
        const { rows } = await connection.query(
            `
            SELECT
                player_id,
                player_name,
                image_url,
                position,
                team,
                ecr AS "draft_ecr",
                bye AS "draft_bye",
                sd AS "draft_sd",
                best AS "draft_best",
                worst AS "draft_worst",
                projected_completion_percentage,
                projected_passing_yds,
                projected_passing_tds,
                projected_rushing_attempts,
                projected_rushing_yds,
                projected_rushing_tds,
                projected_receiving_rec,
                projected_receiving_yds,
                projected_receiving_tds,
                projected_sack,
                projected_int,
                projected_fr,
                projected_ff,
                projected_td,
                projected_safety,
                projected_pa,
                projected_yds_agn,
                projected_fg,
                projected_fga,
                projected_xpt,
                projected_fpts,
                fpts_2024,
                fpts_2023,
                elo
            FROM
                ultimate_draft_table
            ORDER BY
                ecr
        `);

        res.status(200).send(rows);
    } catch (error) {
        console.error("An error occurred while fetching the 'ALL' draft rankings:", error);
        res.status(500).send("An error occurred while fetching the 'ALL' draft rankings");
    } finally {
        await connection.end();
    }
});

module.exports = router;