const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
require("dotenv").config();

const connectionString = process.env.DB_CONNECTION_STRING;

function createConnection() {
    const pool = new Pool({
        connectionString: connectionString
    });

    return pool;
}

router.get("/matchups", async (req, res) => {
    const { year, week} = req.query;
    const connection = createConnection();

    try {
        const { rows } = await connection.query(`
        SELECT
            m."matchupID",
            m."year",
            m."week",
            m."dateTime",
            ht."name" AS homeTeamName,
            at."name" AS awayTeamName,
            ht."initials" AS homeTeamInitials,
            at."initials" AS awayTeamInitials,
            ht."imageURL" AS homeTeamImageURL,
            at."imageURL" AS awayTeamImageURL,
            ht."overall_rating" AS homeTeamOverallRating,
            at."overall_rating" AS awayTeamOverallRating,
            ht."offensive_rating" AS homeTeamOffensiveRating,
            at."offensive_rating" AS awayTeamOffensiveRating,
            ht."defensive_rating" AS homeTeamDefensiveRating,
            at."defensive_rating" AS awayTeamDefensiveRating,
            m."homeTeamID",
            m."awayTeamID",
            ht."stadium" AS homeTeamStadium,
            ht."location" AS homeTeamLocation,
            ht."latitude" AS homeTeamLatitude,
            ht."longitude" AS homeTeamLongitude
        FROM
            matchups m
            JOIN teams ht ON m."homeTeamID" = ht."teamID"
            JOIN teams at ON m."awayTeamID" = at."teamID"
        WHERE
            year = $1
            AND week = $2
        ORDER BY
            m."matchupID";

      `, [year, week]);

        // console.log(rows);

        res.status(200).send(rows);
        await connection.end();
    } catch (error) {
        console.error("An error occurred while fetching team matchup data:", error);
        res.status(500).send("An error occurred while fetching team matchup data");
    }
});

module.exports = router;