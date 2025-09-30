const db = require("../models");
const Cliente = db.clientes;
const Usuario = db.usuarios; // 👈 asegúrate de tener este modelo definido
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

// Login de cliente
exports.loginCliente = async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).send({ message: "Correo y contraseña son obligatorios." });
  }

  try {
    const cliente = await Cliente.findOne({ where: { correo } });
    if (!cliente) return res.status(404).send({ message: "Cliente no encontrado." });

    const validPassword = await bcrypt.compare(contrasena, cliente.contrasena);
    if (!validPassword) return res.status(401).send({ message: "Contraseña incorrecta." });

    const token = jwt.sign(
      { id: cliente.id, correo: cliente.correo, rol: "cliente"},
      SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).send({
      message: "Login exitoso.",
      token,
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        correo: cliente.correo
      }
    });
  } catch (err) {
    console.error("Error en login cliente:", err);
    res.status(500).send({ message: "Error en el proceso de login." });
  }
};

// Login de empleado
exports.loginEmpleado = async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).send({ message: "Correo y contraseña son obligatorios." });
  }

  try {
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) return res.status(404).send({ message: "Empleado no encontrado." });

    const validPassword = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!validPassword) return res.status(401).send({ message: "Contraseña incorrecta." });

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo, rol: "empleado" },
      SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).send({
      message: "Login exitoso.",
      token,
      empleado: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo
      }
    });
  } catch (err) {
    console.error("Error en login empleado:", err);
    res.status(500).send({ message: "Error en el proceso de login." });
  }
};