const db = require("../models");
const Cliente = db.clientes;
const Usuario = db.usuarios; // 👈 asegúrate de tener este modelo definido
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');

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

exports.solicitarRecuperacion = async (req, res) => {
  const { correo } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) return res.status(404).send({ message: 'Correo no registrado' });

    const token = jwt.sign({ id: usuario.id }, SECRET, { expiresIn: '15m' });
    const enlace = `http://localhost:5173/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: 'Farmacia <no-reply@farmacia.com>',
      to: correo,
      subject: 'Recuperación de contraseña',
      html: `
        <p>Hola ${usuario.nombre},</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña. Este enlace expirará en 15 minutos:</p>
        <a href="${enlace}">${enlace}</a>
      `,
    });

    res.send({ message: 'Correo enviado con instrucciones para restablecer la contraseña.' });
  } catch (err) {
    console.error('Error al enviar correo de recuperación:', err);
    res.status(500).send({ message: 'Error al procesar la solicitud.' });
  }
};

exports.restablecerContrasena = async (req, res) => {
  const { token, nuevaContrasena } = req.body;

  if (!token || !nuevaContrasena) {
    return res.status(400).send({ message: 'Token y nueva contraseña son obligatorios.' });
  }

  if (nuevaContrasena.length < 6) {
    return res.status(400).send({ message: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    // Verificamos el token
    const decoded = jwt.verify(token, SECRET);

    // Buscamos al usuario por ID
    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario) {
      return res.status(404).send({ message: 'Usuario no encontrado.' });
    }

    // Hasheamos la nueva contraseña
    const hash = await bcrypt.hash(nuevaContrasena, 10);

    // Actualizamos y guardamos
   usuario.contrasena = nuevaContrasena; // sin hash
await usuario.save(); // el hook la hashea
    console.log("Hash guardado en BD:", usuario.contrasena);


    res.send({ message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });
  } catch (err) {
    console.error('Error al restablecer contraseña:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).send({ message: 'El enlace ha expirado. Solicita uno nuevo.' });
    }
    res.status(400).send({ message: 'Token inválido o error al procesar la solicitud.' });
  }
};

//---------------------------------------------------

exports.solicitarRecuperacioncliente = async (req, res) => {
  const { correo } = req.body;

  try {
    const cliente = await Cliente.findOne({ where: { correo } });
    if (!cliente) return res.status(404).send({ message: 'Correo no registrado' });

    const token = jwt.sign({ id: cliente.id }, SECRET, { expiresIn: '15m' });
    const enlace = `http://localhost:5173/reset-password-cli?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: 'Farmacia <no-reply@farmacia.com>',
      to: correo,
      subject: 'Recuperación de contraseña',
      html: `
        <p>Hola ${cliente.nombre},</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña. Este enlace expirará en 15 minutos:</p>
        <a href="${enlace}">${enlace}</a>
      `,
    });

    res.send({ message: 'Correo enviado con instrucciones para restablecer la contraseña.' });
  } catch (err) {
    console.error('Error al enviar correo de recuperación:', err);
    res.status(500).send({ message: 'Error al procesar la solicitud.' });
  }
};

exports.restablecerContrasenacliente = async (req, res) => {
  const { token, nuevaContrasena } = req.body;

  if (!token || !nuevaContrasena) {
    return res.status(400).send({ message: 'Token y nueva contraseña son obligatorios.' });
  }

  if (nuevaContrasena.length < 6) {
    return res.status(400).send({ message: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    // Verificamos el token
    const decoded = jwt.verify(token, SECRET);

    // Buscamos al usuario por ID
    const cliente = await Cliente.findByPk(decoded.id);
    if (!cliente) {
      return res.status(404).send({ message: 'Usuario no encontrado.' });
    }
 
    // Hasheamos la nueva contraseña
    const hash = await bcrypt.hash(nuevaContrasena, 10);

    // Actualizamos y guardamos
   cliente.contrasena = nuevaContrasena; // sin hash
await cliente.save(); // el hook la hashea
    console.log("Hash guardado en BD:", cliente.contrasena);


    res.send({ message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });
  } catch (err) {
    console.error('Error al restablecer contraseña:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).send({ message: 'El enlace ha expirado. Solicita uno nuevo.' });
    }
    res.status(400).send({ message: 'Token inválido o error al procesar la solicitud.' });
  }
};