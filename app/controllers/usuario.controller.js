const db = require("../models");
const Usuario = db.usuarios;
const Sucursal = db.sucursales;
const Rol = db.rols;



const Op = db.Sequelize.Op;
const bcrypt = require("bcrypt");

// Crear y guardar un nuevo usuario
exports.create = (req, res) => {
  if (!req.body.nombre || !req.body.correo || !req.body.contrasena) {
    res.status(400).send({ message: "Nombre, correo y contraseña son obligatorios." });
    return;
  }

  const usuario = {
    nombre: req.body.nombre,
    correo: req.body.correo,
    contrasena: req.body.contrasena,
    puesto: req.body.puesto,
    telefono: req.body.telefono,
    id_sucursal: req.body.id_sucursal,
    id_rol: req.body.id_rol
  };

  Usuario.create(usuario)
    .then(data => res.status(201).send(data))
    .catch(err => {
      res.status(500).send({
        message: err.message || "Ocurrió un error al crear el usuario."
      });
    });
};

// Obtener todos los usuarios (con filtro opcional por nombre)
/*exports.findAll = (req, res) => {
  const nombre = req.query.nombre;
  const condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;

  Usuario.findAll({ where: condition })
    .then(data => res.send(data))
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error al recuperar los usuarios."
      });
    });
};
*/

exports.findAll = (req, res) => {
  const nombre = req.query.nombre;
  const condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;

  Usuario.findAll({
    where: condition,
    include: [
      { model: Sucursal, as: "sucursal", attributes: ["nombre"] },
      { model: Rol, as: "rol", attributes: ["nombre"] }
    ]
  })
    .then(data => res.send(data))
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error al recuperar los usuarios."
      });
    });
};
// Obtener un usuario por ID
exports.findOne = (req, res) => {
  const id = req.params.id;

  Usuario.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({ 
          message: `No se encontró el usuario con id=${id}.` 
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al recuperar el usuario con id=" + id
      });
    });
};

// Actualizar un usuario por ID
exports.update = (req, res) => {
  const id = req.params.id;

  Usuario.update(req.body, { where: { id: id } })
    .then(num => {
      if (num == 1) {
        res.send({ message: "Usuario actualizado correctamente." });
      } else {
        res.status(404).send({ 
          message: `No se pudo actualizar el usuario con id=${id}.` 
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al actualizar el usuario con id=" + id
      });
    });
};

// Eliminar un usuario por ID
exports.delete = (req, res) => {
  const id = req.params.id;

  Usuario.destroy({ where: { id: id } })
    .then(num => {
      if (num == 1) {
        res.send({ message: "Usuario eliminado correctamente." });
      } else {
        res.status(404).send({ 
          message: `No se encontró el usuario con id=${id}.` 
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al eliminar el usuario con id=" + id
      });
    });
};

// Eliminar todos los usuarios
exports.deleteAll = (req, res) => {
  Usuario.destroy({ where: {}, truncate: false })
    .then(nums => {
      res.send({ message: `${nums} usuarios fueron eliminados.` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error al eliminar todos los usuarios."
      });
    });
};

// Hooks para encriptar contraseña
Usuario.beforeCreate(async (usuario, options) => {
  const salt = await bcrypt.genSalt(10);
  usuario.contrasena = await bcrypt.hash(usuario.contrasena, salt);
});

Usuario.beforeUpdate(async (usuario, options) => {
  if (usuario.changed("contrasena")) {
    const salt = await bcrypt.genSalt(10);
    usuario.contrasena = await bcrypt.hash(usuario.contrasena, salt);
  }
});