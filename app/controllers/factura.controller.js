const db = require("../models");
const Factura = db.facturas;
const Venta = db.ventas;
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const DetalleVenta = db.detalle_ventas;
const Producto = db.productos;
// Función para generar número de factura único
const generarNumeroFactura = async () => {
  const timestamp = Date.now();
  return `F-${timestamp}`;
};

// Crear una factura a partir de una venta
exports.create = async (req, res) => {
  const { id_venta } = req.body;

  try {
    // Verificar que la venta exista
    const venta = await Venta.findByPk(id_venta);
    if (!venta) {
      return res.status(404).send({ message: "Venta no encontrada." });
    }

    // Generar número de factura
    const numero_factura = await generarNumeroFactura();

    // Crear factura
    const factura = await Factura.create({
      numero_factura,
      id_venta
    });

    res.status(201).send({
      message: "Factura generada correctamente.",
      factura
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error al generar la factura."
    });
  }
};
exports.findAll = (req, res) => {
  Factura.findAll({
    include: [{ model: Venta }], // si tienes la asociación definida
    order: [["fecha_emision", "DESC"]]
  })
    .then(data => res.send(data))
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error al recuperar las facturas."
      });
    });
};
exports.findOne = (req, res) => {
  const id = req.params.id;

  Factura.findByPk(id, {
    include: [{ model: Venta }]
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({ message: `No se encontró la factura con id=${id}.` });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al recuperar la factura con id=" + id
      });
    });
};
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Factura.destroy({ where: { id: id } });

    if (num == 1) {
      res.send({ message: "Factura eliminada correctamente." });
    } else {
      res.send({ message: `No se encontró la factura con id=${id}.` });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error al eliminar la factura con id=" + id
    });
  }
};

exports.generarFacturaPDF = async (req, res) => {
  const id = req.params.id;

  try {
    const factura = await Factura.findByPk(id, {
  include: {
    model: Venta,
    as: "venta",
    include: [
      {
        model: DetalleVenta,
        as: "detalle_ventas",
        include: [{ model: Producto }]
      }
    ]
  }
});

    if (!factura) {
      return res.status(404).send({ message: "Factura no encontrada." });
    }

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, `../facturas/factura-${factura.id}.pdf`);
    const dir = path.join(__dirname, "../facturas");

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

    doc.pipe(fs.createWriteStream(filePath));

    // Encabezado
    doc.fontSize(20).text("Factura", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Número: ${factura.numero_factura}`);
    doc.text(`Fecha: ${factura.fecha_emision}`);
    doc.text(`Venta ID: ${factura.id_venta}`);
    doc.moveDown();
   console.log("Factura cargada:", JSON.stringify(factura, null, 2));
    // Detalles de productos
    doc.text("Productos:");
    factura.venta.detalle_ventas.forEach(detalle => {
      doc.text(
        `- ${detalle.producto.nombre} | Cantidad: ${detalle.cantidad} | Precio: Q${detalle.precio_unitario}`
      );
    });

    doc.moveDown();
    doc.text(`Total: Q${factura.venta.total}`, { align: "right" });

    doc.end();

    res.status(200).send({
      message: "Factura PDF generada correctamente.",
      path: `/facturas/factura-${factura.id}.pdf`
    });
  } catch (err) {
    res.status(500).send({ message: "Error al generar la factura PDF." });
    console.error(err);
  }
};