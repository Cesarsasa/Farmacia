const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;


exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).send({ message: "Token no proporcionado o mal formado." });
  }

  const token = authHeader.split(" ")[1]; // 👈 extrae solo el token

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Token inválido." });
    }

    req.clienteId = decoded.id;
    next();
  });
};