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

router.get("/draft-rankings/qb", async (req, res) => {
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
                projected_fpts,
                fpts_2024,
                fpts_2023,
                elo
            FROM
                ultimate_draft_table
            WHERE
                position = 'QB'
            ORDER BY
                ecr
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
                projected_rushing_attempts,
                projected_rushing_yds,
                projected_rushing_tds,
                projected_receiving_rec,
                projected_receiving_yds,
                projected_receiving_tds,
                projected_fpts,
                fpts_2024,
                fpts_2023,
                elo
            FROM
                ultimate_draft_table
            WHERE
                position = 'RB'
            ORDER BY
                ecr;
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
                projected_receiving_rec,
                projected_receiving_yds,
                projected_receiving_tds,
                projected_rushing_attempts,
                projected_rushing_yds,
                projected_rushing_tds,
                projected_fpts,
                fpts_2024,
                fpts_2023,
                elo
            FROM
                ultimate_draft_table
            WHERE
                position = 'WR'
            ORDER BY
                ecr
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
                projected_receiving_rec,
                projected_receiving_yds,
                projected_receiving_tds,
                projected_rushing_attempts,
                projected_rushing_yds,
                projected_rushing_tds,
                projected_fpts,
                fpts_2024,
                fpts_2023,
                elo
            FROM
                ultimate_draft_table
            WHERE
                position = 'TE'
            ORDER BY
                ecr
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
            WHERE
                (position = 'RB' OR position = 'WR' OR position = 'TE')
            ORDER BY
                ecr
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
                projected_sack,
                projected_int,
                projected_fr,
                projected_ff,
                projected_td,
                projected_safety,
                projected_pa,
                projected_yds_agn,
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
                projected_fg,
                projected_fga,
                projected_xpt,
                projected_fpts,
                fpts_2024,
                fpts_2023,
                elo
            FROM
                ultimate_draft_table
            WHERE
                position = 'K'
            ORDER BY
                ecr
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