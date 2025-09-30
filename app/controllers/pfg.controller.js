const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const db = require("../models");
const Factura = db.facturas;
const Venta = db.ventas;
const DetalleVenta = db.detalle_ventas;
const Producto = db.productos;

exports.generarFacturaPDF = async (req, res) => {
  const id = req.params.id;

  try {
    const factura = await Factura.findByPk(id, {
      include: {
        model: Venta,
        include: [{ model: DetalleVenta, include: [Producto] }]
      }
    });

    if (!factura) {
      return res.status(404).send({ message: "Factura no encontrada." });
    }

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, `../facturas/factura-${factura.id}.pdf`);
    doc.pipe(fs.createWriteStream(filePath));

    // Encabezado
    doc.fontSize(20).text("Factura", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Número: ${factura.numero_factura}`);
    doc.text(`Fecha: ${factura.fecha_emision}`);
    doc.text(`Venta ID: ${factura.id_venta}`);
    doc.moveDown();

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
  }
};