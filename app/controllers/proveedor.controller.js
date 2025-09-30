const db = require("../models");
const Proveedor = db.proveedores;
const Op = db.Sequelize.Op;

// Crear un nuevo proveedor
exports.create = (req, res) => {
  if (!req.body.nombre) {
    return res.status(400).send({ message: "El nombre del proveedor es obligatorio." });
  }

  const proveedor = {
    nombre: req.body.nombre,
    contacto: req.body.contacto,
    telefono: req.body.telefono,
    correo: req.body.correo
  };

  Proveedor.create(proveedor)
    .then(data => res.status(201).send(data))
    .catch(err => {
      res.status(500).send({
        message: err.message || "Ocurrió un error al crear el proveedor."
      });
    });
};

// Obtener todos los proveedores
exports.findAll = (req, res) => {
  const nombre = req.query.nombre;
  const condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;

  Proveedor.findAll({ where: condition })
    .then(data => res.send(data))
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error al recuperar los proveedores."
      });
    });
};

// Obtener un proveedor por ID
exports.findOne = (req, res) => {
  const id = req.params.id;

  Proveedor.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({ message: `No se encontró el proveedor con id=${id}.` });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al recuperar el proveedor con id=" + id
      });
    });
};

// Actualizar proveedor por ID
exports.update = (req, res) => {
  const id = req.params.id;

  Proveedor.update(req.body, { where: { id } })
    .then(num => {
      if (num == 1) {
        res.send({ message: "Proveedor actualizado correctamente." });
      } else {
        res.status(404).send({ message: `No se pudo actualizar el proveedor con id=${id}.` });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al actualizar el proveedor con id=" + id
      });
    });
};

// Eliminar proveedor por ID
exports.delete = (req, res) => {
  const id = req.params.id;

  Proveedor.destroy({ where: { id } })
    .then(num => {
      if (num == 1) {
        res.send({ message: "Proveedor eliminado correctamente." });
      } else {
        res.status(404).send({ message: `No se encontró el proveedor con id=${id}.` });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al eliminar el proveedor con id=" + id
      });
    });
};

// Eliminar todos los proveedores
exports.deleteAll = (req, res) => {
  Proveedor.destroy({ where: {}, truncate: false })
    .then(nums => {
      res.send({ message: `${nums} proveedores fueron eliminados.` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error al eliminar todos los proveedores."
      });
    });
};