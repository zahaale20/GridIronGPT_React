const express = require("express");

const usersRoutes = require("./routes/usersRoutes");
const rankingsRoutes = require("./routes/rankingsRoutes");
const matchupsRoutes = require("./routes/matchupsRoutes")
const openAIRoutes = require("./routes/openAIRoutes")

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8000;
var cors = require("cors");

app.use(cors());
app.use(express.json());

app.use("/users", usersRoutes);
app.use("/rankings", rankingsRoutes);
app.use("/matchups", matchupsRoutes);
app.use("/openai", openAIRoutes);

app.listen(PORT, () => {
	console.log(`\nServer is running on port ${PORT}`);
});
