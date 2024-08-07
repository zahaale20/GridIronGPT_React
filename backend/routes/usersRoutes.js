// userRoutes.js
/* global require, process, module */
const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const {google} = require("googleapis");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {verifyToken} = require("../util/middleware");
const {Pool} = require("pg");
require("dotenv").config();

const connectionString = process.env.DB_CONNECTION_STRING; // stores supabase db connection string, allowing us to connect to supabase db
// console.log("\nconnectionString: ", connectionString);

const secretKey = process.env.JWT_SECRET_KEY; // stores jwt secret key
// console.log("\nsecretKey: ", secretKey);

const oauth2Client = new google.auth.OAuth2(
	process.env.REACT_APP_GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.REACT_APP_BACKEND_LINK + "/users/auth/google/callback"
);
// console.log("\noAuth2Client: ", oauth2Client);

// Create connection pool to connect to the database.
function createConnection() {
	// Pool is a cache of database connections. Allows pre-established connections to be reused instead of constantly opening/closing connections
	const pool = new Pool({
		connectionString: connectionString
	});

	return pool;
}

// Asynchronous route handler to check if non-duplicate user info already exists in the database.
router.post("/check", async (req, res) => {
	// async function means we can use await keyword to pause the function's execution at asynchronous operations without blocking the entire server's execution
	const {username, email, phoneNumber} = req.body;
	let conflict = false;

	try {
		// throw error if any fields are empty (which they shouldn't be)
		if (username === null || email === null || phoneNumber === null) {
			throw Error;
		}
		const connection = createConnection();
		// Check if username already exists in db. If so, conflict is the username
		const {rows: usernameResult} = await connection.query(
			"SELECT 1 FROM users WHERE username = $1 LIMIT 1",
			[username]
		);
		if (usernameResult.length > 0) {
			conflict = "Username";
		}

		// Check if phone number already exists in db. If so, conflict is phone number
		const {rows: phoneResult} = await connection.query(
			"SELECT 1 FROM users WHERE \"phoneNumber\" = $1 LIMIT 1",
			[phoneNumber]
		);
		if (phoneResult.length > 0) {
			conflict = "Phone Number";
		}

		// Check if email already exists in db...
		const {rows: emailResult} = await connection.query(
			"SELECT 1 FROM users WHERE email = $1 LIMIT 1",
			[email]
		);
		if (emailResult.length > 0) {
			conflict = "Email";
		}

		// If conflict for any of the above is found, we send back the error message
		if (conflict) {
			res.status(409).json({
				exists: true,
				message: `${conflict} already exists.`,
				conflict
			}); // HTTP 409 (Conflict) - element already exists for one of user's attributes
		} else {
			// else there is no conflict
			res.status(200).json({
				exists: false,
				message: "No conflicts with username, email, or phone number."
			}); // HTTP 200 (OK)
		}
		// catch any missed errors
	} catch (error) {
		res.status(500).json({error: "Failed to check user details"});
	} // HTTP 500 (Internal Server Error) - unexpected conditions
});

// Insert user info into database upon signup.
router.post("/register", async (req, res) => {
	const {
		username,
		fullName,
		password,
		email,
		phoneNumber: phoneNumber
	} = req.body;

    // console.log("Received data:", { username, fullName, password, email, phoneNumber });
	
    try {
		if (
			username === null ||
			fullName === null ||
			password === null ||
			email === null ||
			phoneNumber === null
		) {
			throw Error;
		} // ensure fields are filled, throw error if not
		
        // Asynchronously hash the password using bcrypt library. 10 saltrounds = hash password 10 times. the more rounds the longer it takes to finish hashing
		// console.log("\npassword: ", password);
        const hashedPassword = await bcryptjs.hash(password, 10); // await pauses execution of async function for bcrypt.hash to run
        // console.log("\nhashedPassword: ", hashedPassword);
		const connection = createConnection();

		// Insert user details into the users table.
		// result is used only to execute the query... we don't actually need it for anything else
		const {result} = await connection.query(
			"INSERT INTO users (username, \"fullName\", password, email, \"phoneNumber\") VALUES ($1, $2, $3, $4, $5)",
			[username, fullName, hashedPassword, email, phoneNumber]
		);
        // console.log("\n result: ", result);

		await connection.end();
		res.status(201).json({message: "User registered successfully"}); // HTTP 201 (Created) - led to creation of new resource
	} catch (error) {
		res.status(500).json({error: "Failed to register user"}); // HTTP 500 (Internal Server Error) - unexpected condition
	}
});

// Sign in user after verifying account details.
router.post("/login", async (req, res) => {
	const {identifier, password} = req.body;
	if (typeof identifier !== "string" || typeof password !== "string") {
		return res.status(400).json({
			error: "Identifier and password are required and must be strings."
		}); // HTTP 400 (Bad Request) - invalid user input format
	}

	try {
		let connection = createConnection(); // eslint-disable-line no-unused-vars
		let query = "SELECT * FROM users WHERE ";
		let queryParams = [];

		if (identifier.includes("@")) {
			query += "email = $1";
			queryParams.push(identifier);
		} else if (/^\d+$/.test(identifier) && identifier.length === 10) {
			query += "\"phoneNumber\" = $1";
			queryParams.push(identifier);
		} else {
			query += "username = $1";
			queryParams.push(identifier);
		}

		const {rows: users} = await connection.query(query, queryParams); // eslint-disable-line no-unused-vars

		if (users.length > 0) {
			const user = users[0];
			const validPassword = await bcryptjs.compare(
				password,
				user.password
			);

			if (validPassword) {
				// creating JWT
				const token = jwt.sign({username: user.username}, secretKey, {
					expiresIn: "24h"
				});
				await connection.end(); // eslint-disable-line no-unused-vars
				res.status(200).json({
					message: "User logged in successfully",
					token
				}); // HTTP 200 (OK)
			} else {
				res.status(401).json({error: "Invalid password"}); // HTTP 401 (Unauthorized) - incorrect credentials/password
			}
		} else {
			res.status(404).json({error: "User not found"}); // HTTP 404 (Not Found) - can't find existing resource (user)
		}
	} catch (error) {
		res.status(500).json({error: "Failed to log in"}); // HTTP 500 (Internal Server Error) - unexpected error/condition
	}
});

router.get("/auth/google", (req, res) => {
	const authUrl = oauth2Client.generateAuthUrl({
		access_type: "offline", // Indicates that we need to retrieve a refresh token
		scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
		redirect_uri:
			process.env.REACT_APP_BACKEND_LINK + "/users/auth/google/callback"
	});
	res.redirect(authUrl);
});

router.get("/auth/google/callback", async (req, res) => {
	try {
		const {tokens} = await oauth2Client.getToken(req.query.code); // Exchange the authorization code for tokens

		oauth2Client.setCredentials(tokens);

		const oauth2 = google.oauth2({
			auth: oauth2Client,
			version: "v2"
		});
		const userInfo = await oauth2.userinfo.get(); // Get user info
		const email = decodeURIComponent(userInfo.data.email);
		const name = decodeURIComponent(userInfo.data.name);

		const connection = createConnection();

		const {rows: existingUsers} = await connection.query(
			"SELECT * FROM users WHERE email = $1",
			[email]
		);

		if (existingUsers.length > 0) {
			// if there is a user returned from the select statement...
			const user = existingUsers[0];
			const token = jwt.sign({username: user.username}, secretKey, {
				expiresIn: "24h"
			});
			res.redirect(
				process.env.REACT_APP_FRONTEND_LINK +
					`/login/google?token=${encodeURIComponent(token)}`
			);
		} else {
			// if there isnt a user returned from the select statement...
			res.redirect(
				process.env.REACT_APP_FRONTEND_LINK +
					`/additional-details?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`
			);
		}
	} catch (error) {
		res.status(500).json({error: "Authentication failed", details: error});
	}
});

router.post("/register-google-user", async (req, res) => {
	const {email, name, username, phoneNumber} = req.body;

	try {
		const connection = createConnection();

		// check if the user already exists in the database
		const existingUser = await connection.query(
			"SELECT * FROM users WHERE email = $1",
			[email]
		);

		if (existingUser.rows.length > 0) {
			const user = existingUser.rows[0];

			// if the user exists and has a password, they should use their Haggle credentials to log in
			if (user.password) {
				return res.status(409).json({
					error: "User exists with a password. Please use Haggle credentials to log in."
				});
			}

			// if the user exists and does not have a password, continue the registration process
			const token = jwt.sign({username: user.username}, secretKey, {
				expiresIn: "24h"
			});
			res.redirect(
				process.env.REACT_APP_FRONTEND_LINK +
					`/profile?token=${encodeURIComponent(token)}`
			);
		}

		// if the user does not exist in the database, insert new user details
		const result = await connection.query(
			"INSERT INTO users (email, \"fullName\", username, \"phoneNumber\") VALUES ($1, $2, $3, $4) RETURNING *",
			[email, name, username, phoneNumber]
		);
		const newUser = result.rows[0];
		const token = jwt.sign({username: newUser.username}, secretKey, {
			expiresIn: "24h"
		});
		res.status(201).json({
			message: "User registered successfully via Google",
			token
		});
	} catch (error) {
		res.status(500).json({error: "Failed to register user"});
	}
});

router.get("/profile", verifyToken, async (req, res) => {
	const username = req.user.username;
	try {
		const connection = createConnection();
		// Retrieve user details from extracted username...
		const {rows: user} = await connection.query(
			"SELECT username, \"fullName\", email, \"phoneNumber\", \"userID\" FROM users WHERE username = $1",
			[username]
		);

		// And if the user exists, return their information.
		if (user.length > 0) {
			res.status(200).json(user[0]); // HTTP (OK) - user exists
		}
	} catch (error) {
		res.status(500).json({error: "Failed to fetch user profile"}); // HTTP 500 (Internal Server Error) - unexpected error/condition
	}
});

router.get("/userID", async (req, res) => {
	const {username} = req.body;
	try {
		if (username === null) throw Error();
		const connection = createConnection();
		// Retrieve userID from queried username.
		const {rows: user} = await connection.query(
			"SELECT \"userID\" FROM users WHERE username = $1",
			[req.query.username]
		);

		// And if user exists, return the userID.
		if (user.length > 0) {
			res.status(200).json({userID: user[0].userID}); // HTTP 200 (OK) - user exists, return userId
		} else {
			res.status(404).json({error: "User not found"}); // HTTP 404 (Not Found) - error finding resource (user)
		}
	} catch (error) {
		res.status(500).json({error: "Failed to fetch userID"}); // HTTP 500 (Internal Server Error) - Unexpected condition met
	}
});

// this will need to be modified to delete all listings, reviews, etc... that are dependent on userID as foreign key
router.delete("/delete", async (req, res) => {
	const {username, password} = req.body;
	try {
		if (!username || !password)
			throw Error("Username and password are required");

		const connection = createConnection();

		// Check if the username exists
		const {rows: usernameResult} = await connection.query(
			"SELECT 1 FROM users WHERE username = $1 LIMIT 1",
			[username]
		);
		const usernameExists = usernameResult.length > 0;

		if (usernameExists) {
			// Check if the provided password matches the hashed password in the database
			const {rows: users} = await connection.query(
				"SELECT password FROM users WHERE username = $1",
				[username]
			);

			const user = users[0];
			const validPassword = await bcryptjs.compare(
				password,
				user.password
			);

			if (validPassword) {
				// Delete the user account
				await connection.query(
					"DELETE FROM users WHERE username = $1",
					[username]
				);
				res.status(200).json({message: "Account deleted successfully"}); // HTTP 200 (OK)
			} else {
				res.status(401).json({error: "Invalid password"}); // HTTP 401 (Unauthorized) - lacks valid authentication credentials
			}
		} else {
			res.status(404).json({error: "User not found"}); // HTTP 404 (Not Found) - resource not found
		}
	} catch (error) {
		res.status(500).json({error: "Failed to delete account"}); // HTTP 500 (Internal Server Error) - unexpected condition met, throw error
	}
});

router.post("/forgot-password", async (req, res) => {
	const {email} = req.body;
	if (!email) {
		return res.status(400).json({error: "Email is required"});
	}

	try {
		const connection = createConnection();
		// Verify if email exists
		const {rows: users} = await connection.query(
			"SELECT * FROM users WHERE email = $1",
			[email]
		);
		if (users.length === 0) {
			return res.status(404).json({error: "User not found"});
		}

		// use crypto to generate a new password reset token + expiration time (1 hour from now)
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now (60 * 60 * 1000) ms

		// Save the resetToken and expiration time to the user's record in the database
		await connection.query(
			"UPDATE users SET \"resetPasswordToken\" = $1, \"resetPasswordExpires\" = $2 WHERE email = $3",
			[resetToken, resetExpires, email]
		);

		// create the reset password url using the token
		const resetUrl =
			process.env.REACT_APP_FRONTEND_LINK +
			`/reset-password?token=${resetToken}`;

		// use nodemailer
		const nodemailer = require("nodemailer");
		const transporter = nodemailer.createTransport({
			service: "outlook",
			auth: {
				user: process.env.OUTLOOK_EMAIL,
				pass: process.env.OUTLOOK_PASSWORD
			}
		});

        // console.log("\ntransporter: ", transporter);

		const mailOptions = {
			from: process.env.OUTLOOK_EMAIL, // Replace with your email
			to: email, // The user's email address
			subject: "Password Reset Request",
			html: `<p>You requested a password reset. Click the link below to set a new password:</p>
             <p>
                <a href="${resetUrl}">Reset Password</a>
             </p>`
		};

		transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				res.status(500).json({
					error: "Failed to send forgot password email"
				});
			} else {
				// console.log(info);
				res.json({message: "Reset link sent to your email address"});
			}
		});
		await connection.end();
	} catch (error) {
		res.status(500).json({error: "Failed to send forgot password email"});
	}
});

router.post("/reset-password", async (req, res) => {
	const { token, password } = req.body;
  
	try {
	  const connection = createConnection();
  
	  // Verify token and its expiration
	  const { rows: users } = await connection.query(
		"SELECT * FROM users WHERE \"resetPasswordToken\" = $1 AND \"resetPasswordExpires\" > NOW()",
		[token]
	  );
  
	  if (users.length === 0) {
		return res.status(400).json({ error: "Invalid or expired token" });
	  }
  
	  const hashedPassword = await bcryptjs.hash(password, 10);
	  await connection.query(
		"UPDATE users SET password = $1, \"resetPasswordToken\" = NULL, \"resetPasswordExpires\" = NULL WHERE \"userID\" = $2",
		[hashedPassword, users[0].userID]
	  );
  
	  res.json({ message: "Password has been reset successfully" });
	} catch (error) {
	  res.status(500).json({ error: "Failed to reset password" });
	}
  });

// Retrieve user details for given userID.
router.get("/:userID/", async (req, res) => {
	try {
		// Extract userID from query parameters.
		const {userID} = req.params;

		// Retrieve user details from database if user exists.
		const connection = createConnection();
		const {rows} = await connection.query(
			"SELECT * FROM users WHERE \"userID\" =  $1 LIMIT 1",
			[userID]
		);
		res.status(200).send(rows);
		await connection.end();
	} catch (error) {
		console.error("An error occurred while fetching the user:", error);
		res.status(500).send("An error occurred while fetching the user");
	}
});

module.exports = router;