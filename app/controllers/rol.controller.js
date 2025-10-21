const db = require("../models");
const Rol = db.rols;
const Op = db.Sequelize.Op;

// Crear un nuevo rol
exports.create = (req, res) => {
  if (!req.body.nombre) {
    return res.status(400).send({ message: "El nombre del rol es obligatorio." });
  }

  const rol = {
    nombre: req.body.nombre,
    descripcion: req.body.descripcion
  };

  Rol.create(rol)
    .then(data => res.status(201).send(data))
    .catch(err => {
      res.status(500).send({
        message: err.message || "Ocurrió un error al crear el rol."
      });
    });
};

// Obtener todos los roles
exports.findAll = (req, res) => {
  const nombre = req.query.nombre;
  const condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;

  Rol.findAll({ where: condition })
    .then(data => res.send(data))
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error al recuperar los roles."
      });
    });
};

// Obtener un rol por ID
exports.findOne = (req, res) => {
  const id = req.params.id;

  Rol.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({ message: `No se encontró el rol con id=${id}.` });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al recuperar el rol con id=" + id
      });
    });
};

// Actualizar un rol por ID
exports.update = (req, res) => {
  const id = req.params.id;

  Rol.update(req.body, { where: { id: id } })
    .then(num => {
      if (num == 1) {
        res.send({ message: "Rol actualizado correctamente." });
      } else {
        res.status(404).send({ message: `No se pudo actualizar el rol con id=${id}.` });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al actualizar el rol con id=" + id
      });
    });
};

// Eliminar un rol por ID
exports.delete = (req, res) => {
  const id = req.params.id;

  Rol.destroy({ where: { id: id } })
    .then(num => {
      if (num == 1) {
        res.send({ message: "Rol eliminado correctamente." });
      } else {
        res.status(404).send({ message: `No se encontró el rol con id=${id}.` });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al eliminar el rol con id=" + id
      });
    });
};

// Eliminar todos los roles
exports.deleteAll = (req, res) => {
  Rol.destroy({ where: {}, truncate: false })
    .then(nums => {
      res.send({ message: `${nums} roles fueron eliminados.` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error al eliminar todos los roles."
      });
    });
};