const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const { Pool } = require("pg");
require("dotenv").config();

// Initialize OpenAI API with the new SDK pattern
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const connectionString = process.env.DB_CONNECTION_STRING;

// Create connection pool to connect to the database.
function createConnection() {
    const pool = new Pool({
        connectionString: connectionString
    });

    return pool;
}

router.get("/initialize", async (req, res) => {
    const connection = createConnection();

    try {
        const { rows } = await connection.query(`
            SELECT
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
                round(sum(fantasy_points_ppr)::numeric, 1) as FNTSY_FPTS
            FROM
                offense_stats p
                join teams t on p.recent_team = t."teamID"
            WHERE 
                p.season = 2023 AND 
                p.position = 'WR'
            GROUP BY 
                p.player_name, p.position, p.recent_team, p.headshot_url, t.initials
            ORDER BY 
                round(sum(fantasy_points_ppr)::numeric, 1) DESC;
        `);

        res.status(200).send(rows);
        await connection.end();
    } catch (error) {
        console.error("An error occurred while fetching team matchup data:", error);
        res.status(500).send("An error occurred while fetching team matchup data");
    }
});

// Route to handle English to SQL translation using OpenAI
router.post("/search", async (req, res) => {
    const { userQuery } = req.body; 

    if (!userQuery) {
        return res.status(400).json({ error: "No query provided" });
    }

    try {
        const prompt = `
        Given the following column names from the 'offense_stats' table: 
        player_id	player_name	player_display_name	position	position_group	headshot_url	recent_team	season	week	season_type	opponent_team	completions	attempts	passing_yards	passing_tds	interceptions	sacks	sack_yards	sack_fumbles	sack_fumbles_lost	passing_air_yards	passing_yards_after_catch	passing_first_downs	passing_epa	passing_2pt_conversions	pacr	dakota	carries	rushing_yards	rushing_tds	rushing_fumbles	rushing_fumbles_lost	rushing_first_downs	rushing_epa	rushing_2pt_conversions	receptions	targets	receiving_yards	receiving_tds	receiving_fumbles	receiving_fumbles_lost	receiving_air_yards	receiving_yards_after_catch	receiving_first_downs	receiving_epa	receiving_2pt_conversions	racr	target_share	air_yards_share	wopr	special_teams_tds	fantasy_points	fantasy_points_ppr
        
        WITH Example row (offense_stats): 
        00-0035640	D.Metcalf	DK Metcalf	WR	WR	https://static.www.nfl.com/image/private/f_auto,q_auto/league/u4cefcz7gjvby8c2kdkm	29	2023	3	REG	5	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	6	8	112	0	0	0	118	28	5	6.30097286816454	0	0.949152542372881	0.228571428571429	0.389438943894389	0.615464403583216	0	11.2	17.2
        
        AND Given the following column names from the 'defense_stats' table: 
        season	week	season_type	player_id	player_name	player_display_name	position	position_group	headshot_url	team	def_tackles	def_tackles_solo	def_tackles_with_assist	def_tackle_assists	def_tackles_for_loss	def_tackles_for_loss_yards	def_fumbles_forced	def_sacks	def_sack_yards	def_qb_hits	def_interceptions	def_interception_yards	def_pass_defended	def_tds	def_fumbles	def_fumble_recovery_own	def_fumble_recovery_yards_own	def_fumble_recovery_opp	def_fumble_recovery_yards_opp	def_safety	def_penalty	def_penalty_yards
        
        WITH Example row (defense_stats): 
        2023	1	REG	00-0031608	Q.Diggs	Quandre Diggs	FS	DB	https://static.www.nfl.com/image/private/f_auto,q_auto/league/mss6qdobrthhkns28avb	29	0	0	0	3	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	1	15

        AND Given the following column names from the 'kicking_stats' table: 
        season	week	season_type	player_id	team	player_name	player_display_name	position	position_group	headshot_url	fg_made	fg_att	fg_missed	fg_blocked	fg_long	fg_pct	fg_made_0_19	fg_made_20_29	fg_made_30_39	fg_made_40_49	fg_made_50_59	fg_made_60_	fg_missed_0_19	fg_missed_20_29	fg_missed_30_39	fg_missed_40_49	fg_missed_50_59	fg_missed_60_	fg_made_list	fg_missed_list	fg_blocked_list	fg_made_distance	fg_missed_distance	fg_blocked_distance	pat_made	pat_att	pat_missed	pat_blocked	pat_pct	gwfg_att	gwfg_distance	gwfg_made	gwfg_missed	gwfg_blocked

        WITH Example row (kicking_stats): 
        2023	2	REG	00-0023853	1	M.Prater	Matt Prater	K	SPEC	https://static.www.nfl.com/image/private/f_auto,q_auto/league/fqsjhn7vjb6lzhzctyiq	2	3	1	0	44	0.667	0	0	1	1	0	0	0	0	0	0	1	0	37;44	55	None	81	55	0	2	2	0	0	1	0	0	0	0	0

        AND Given the following column names for the 'teams' table:
        teamID	name	latitude	longitude	stadium	location	initials	imageURL	record	overall_rating	offensive_rating	defensive_rating

        WITH Example row (teams):
        29	Seattle Seahawks 	47.5952	-118.336687594151	Lumen Field	Seattle, WA	SEA	https://logos-world.net/wp-content/uploads/2023/09/Seattle-Seahawks-Logo.png	0-0-0	80	79	81
        
        ...
        Based on these data tables, write a PostgreSQL query to answer the following question: ${userQuery}
        ...
        Here is an example for the user query: "What are the top wide receivers of 2023?": 

        SELECT
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
            round(sum(fantasy_points_ppr)::numeric, 1) as FNTSY_FPTS
        FROM
            offense_stats p
            join teams t on p.recent_team = t."teamID"
        WHERE 
            p.season = 2023 AND 
            p.position = 'WR'
        GROUP BY 
            p.player_name, p.position, p.recent_team, p.headshot_url, t.initials
        ORDER BY 
            round(sum(fantasy_points_ppr)::numeric, 1) DESC;
        ...
        Guidelines:
        1. Use the above query as an example for answering user queries.
        2. Ensure only the columns in the provided sql example are used.
            2a. If it is implied or user specifically wants to see average stats of a player, use the same columns but use the round(avg(<>)::numeric, 1) function.
            2b. Else if, weekly stats is implied, do not do sum. if yearly stats is implied (usually is), like the sql query example, do sum.
        3. Ensure the output is a PostgreSQL query only, with no extra characters or comments. Do not apply any limits on the number of rows returned.
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant that translates natural language queries into optimized SQL queries." },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            max_tokens: 500
        });

        const sqlQuery = completion.choices[0].message.content.trim();

        res.json({ sqlQuery });
    } catch (error) {
        console.error("Failed to fetch from OpenAI:", error);
        res.status(500).json({
            error: "Failed to process the request",
            message: error.message || "Unknown error"
        });
    }
});

router.post("/execute-query", async (req, res) => {
    const { sqlQuery } = req.body;

    if (!sqlQuery) {
        return res.status(400).json({ error: "No SQL query provided" });
    }

    const connection = createConnection();

    try {
        const { rows } = await connection.query(sqlQuery);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error executing SQL query:", error);
        res.status(500).json({
            error: "Failed to execute SQL query",
            message: error.message || "Unknown error"
        });
    } finally {
        await connection.end();
    }
});

module.exports = router;