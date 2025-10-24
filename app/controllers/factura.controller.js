const db = require("../models");
const Factura = db.facturas;
const Venta = db.ventas;
const PDFDocument = require("pdfkit");
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
  include: [{
    association: "venta",
    include: [
      { association: "cliente" },
      { association: "usuario" },
      { association: "sucursal" },
      {
        association: "detalle_ventas",
        include: ["producto"]
      }
    ]
  }],
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
          { association: "cliente" },
          { association: "usuario" },
          { association: "sucursal" },
          {
            association: "detalle_ventas",
            include: ["producto"]
          }
        ]
      }
    });

    if (!factura) {
      return res.status(404).send({ message: "Factura no encontrada." });
    }

    // Configurar encabezado para abrir en navegador
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=factura.pdf");

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).text("Factura", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Número: ${factura.numero_factura}`);
    doc.text(`Fecha: ${new Date(factura.fecha_emision).toLocaleDateString()}`);
    doc.moveDown();

    // Datos del cliente y sucursal
    doc.fontSize(12).text(`Cliente: ${factura.venta.cliente?.nombre || "—"}`);
    doc.text(`Sucursal: ${factura.venta.sucursal?.nombre || "—"}`);
    doc.text(`Usuario: ${factura.venta.usuario?.nombre || "—"}`);
    doc.moveDown();

    // Tabla de productos
    doc.fontSize(12).text("Productos:", { underline: true });
    doc.moveDown();

    const tableTop = doc.y;
    const itemSpacing = 20;

    doc.font("Helvetica-Bold");
    doc.text("Producto", 50, tableTop);
    doc.text("Cantidad", 250, tableTop);
    doc.text("Precio Unitario", 350, tableTop);
    doc.text("Subtotal", 470, tableTop);
    doc.font("Helvetica");

    factura.venta.detalle_ventas.forEach((detalle, i) => {
      const y = tableTop + itemSpacing * (i + 1);
      const nombre = detalle.producto?.nombre || "—";
      const cantidad = detalle.cantidad;
      const precio = parseFloat(detalle.precio_unitario).toFixed(2);
      const subtotal = (detalle.cantidad * detalle.precio_unitario).toFixed(2);

      doc.text(nombre, 50, y);
      doc.text(cantidad.toString(), 250, y);
      doc.text(`Q${precio}`, 350, y);
      doc.text(`Q${subtotal}`, 470, y);
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total: Q${parseFloat(factura.venta.total).toFixed(2)}`, {
      align: "right",
      underline: true
    });

    doc.end();
  } catch (err) {
    console.error("Error al generar PDF:", err);
    res.status(500).send({ message: "Error al generar la factura PDF." });
  }
};

exports.obtenerUltimaVenta = async (req, res) => {
  const id_cliente = req.params.id;

  if (!id_cliente) {
    return res.status(400).json({ message: "Falta el id_cliente" });
  }

  try {
    const venta = await Venta.findOne({
      where: { id_cliente },
      order: [["createdAt", "DESC"]],
    });

    if (!venta) {
      return res.status(404).json({ message: "No se encontró ninguna venta" });
    }

    res.json(venta);
  } catch (err) {
    console.error("❌ Error al obtener venta:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};