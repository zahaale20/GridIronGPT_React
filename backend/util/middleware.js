const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const secretKey = process.env.JWT_SECRET_KEY;
    // Extract the 'Authorization' header from the incoming request.
    const bearerHeader = req.headers["authorization"];
    
    if (!bearerHeader) {
        return res.status(401).send({ message: "Authentication token is required" });
    }

    // The expected format of the header is "Bearer [token]". Split the header to extract the token part.
    const parts = bearerHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(400).send({ message: "Token format is invalid" });
    }
    const token = parts[1];

    // Use jwt.verify to check if the token is valid.
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            // Differentiate between types of JWT errors
            if (err.name === "TokenExpiredError") {
                return res.status(401).send({ message: "Token has expired" });
            } else if (err.name === "JsonWebTokenError") {
                return res.status(401).send({ message: "Token is invalid" });
            } else {
                return res.status(401).send({ message: "Failed to authenticate token" });
            }
        }
        req.user = decoded;
        next();
    });
};

module.exports = { verifyToken };
