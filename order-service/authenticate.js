const jwt = require("jsonwebtoken");

module.exports = async function (req, res, next) {
  // "Bearer <token>".split(" ")
  // [ "Bearer", "<Token>" ]
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, "secret", (err, user) => {
    if (err) return res.json({ message: err });

    req.user = user;
    next();
  });
};
