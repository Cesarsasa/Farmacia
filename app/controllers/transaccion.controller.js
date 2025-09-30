const db = require("../models");
const Transaccion = db.transacciones;
const Factura = db.facturas;
const Op = db.Sequelize.Op;

// Crear una transacción
exports.create = async (req, res) => {
  const { id_factura, metodo_pago, monto, estado } = req.body;

  if (!id_factura || !metodo_pago || !monto || !estado) {
    return res.status(400).send({ message: "Todos los campos son obligatorios." });
  }

  try {
    // Verificar que la factura exista
    const factura = await Factura.findByPk(id_factura);
    if (!factura) {
      return res.status(404).send({ message: "Factura no encontrada." });
    }

    const transaccion = await Transaccion.create({
      id_factura,
      metodo_pago,
      monto,
      estado
    });

    res.status(201).send({
      message: "Transacción registrada correctamente.",
      transaccion
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error al registrar la transacción."
    });
  }
};

// Obtener todas las transacciones
exports.findAll = (req, res) => {
  Transaccion.findAll({
    include: [{ model: Factura }],
    order: [["fecha", "DESC"]]
  })
    .then(data => res.send(data))
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error al recuperar las transacciones."
      });
    });
};

// Obtener una transacción por ID
exports.findOne = (req, res) => {
  const id = req.params.id;

  Transaccion.findByPk(id, {
    include: [{ model: Factura }]
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({ message: `No se encontró la transacción con id=${id}.` });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al recuperar la transacción con id=" + id
      });
    });
};

// Actualizar una transacción
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Transaccion.update(req.body, { where: { id: id } });

    if (num == 1) {
      res.send({ message: "Transacción actualizada correctamente." });
    } else {
      res.status(404).send({ message: `No se pudo actualizar la transacción con id=${id}.` });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error al actualizar la transacción con id=" + id
    });
  }
};

// Eliminar una transacción
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Transaccion.destroy({ where: { id: id } });

    if (num == 1) {
      res.send({ message: "Transacción eliminada correctamente." });
    } else {
      res.status(404).send({ message: `No se encontró la transacción con id=${id}.` });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error al eliminar la transacción con id=" + id
    });
  }
};