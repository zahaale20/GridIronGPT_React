const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING
});

router.get('/teams', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('teams')
            .select('*');

        if (error) {
            throw error;
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

module.exports = router;