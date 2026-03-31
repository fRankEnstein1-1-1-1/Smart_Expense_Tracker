const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided"
      });
    }
console.log("AUTH HEADER:", authHeader);
    const token = authHeader.split(" ")[1];
    console.log("reached split")

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();

  } catch (error) {
    console.log(error.message)
    res.status(401).json({
      message: "Invalid token"
    });

  }

};

module.exports = protect;