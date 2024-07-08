const express = require("express");

const userRoutes = require("./routes/userRoutes");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8000;
var cors = require("cors");

app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);

app.listen(PORT, () => {
	console.log(`\nServer is running on port ${PORT}`);
});
