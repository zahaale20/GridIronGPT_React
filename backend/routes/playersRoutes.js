const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING
});

// Route to execute provided SQL query
router.post("/execute-query", async (req, res) => {
    const { query, params } = req.body;

    if (!query) {
        return res.status(400).json({ error: "SQL query is required" });
    }

    try {
        // Execute the query with parameters to mitigate SQL injection risk
        const { rows } = await pool.query(query, params || []);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: "Failed to execute query", details: error.message });
    }
});



module.exports = router;