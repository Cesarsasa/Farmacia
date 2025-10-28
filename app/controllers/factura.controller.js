const db = require("../models");
const Factura = db.facturas;
const Venta = db.ventas;
const PDFDocument = require("pdfkit");
const DetalleVenta = db.detalle_ventas;
const Producto = db.productos;
const getStream = require("get-stream");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

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

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=factura.pdf");

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // ✅ Fondo gris claro
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f2f2f2");
    doc.fillColor("black"); // Volver a color de texto

    // ✅ Encabezado
    doc.fontSize(20).fillColor("#333").text("Factura", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Número: ${factura.numero_factura}`);
    doc.text(`Fecha: ${new Date(factura.fecha_emision).toLocaleDateString()}`);
    drawBlueLine(doc);

    // ✅ Datos del cliente
    const cliente = factura.venta.cliente;
    doc.fontSize(12).text("Datos del cliente:", { underline: true });
    doc.moveDown();
    doc.text(`Nombre: ${cliente?.nombre || "—"} ${cliente?.apellido || ""}`);
    doc.text(`NIT: ${cliente?.nit || "—"}`);
    doc.text(`Correo: ${cliente?.correo || "—"}`);
    doc.text(`Teléfono: ${cliente?.telefono || "—"}`);
    doc.text(`Dirección: ${cliente?.direccion || "—"}`);
    drawBlueLine(doc);

    // ✅ Datos de sucursal y usuario
    doc.fontSize(12).text("Sucursal y vendedor:", { underline: true });
    doc.moveDown();
    doc.text(`Sucursal: ${factura.venta.sucursal?.nombre || "—"}`);
    doc.text(`Usuario: ${factura.venta.usuario?.nombre || "—"}`);
    drawBlueLine(doc);

    // ✅ Tabla de productos
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
    drawBlueLine(doc);

    // ✅ Total
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

// ✅ Función para dibujar línea azul horizontal
function drawBlueLine(doc) {
  const y = doc.y + 5;
  doc.moveTo(50, y).lineTo(550, y).strokeColor("#0074D9").lineWidth(1).stroke();
  doc.moveDown();
}


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



exports.enviarFacturaPorCorreo = async (req, res) => {
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

    const cliente = factura.venta.cliente;
    if (!cliente?.correo) {
      return res.status(400).send({ message: "El cliente no tiene correo registrado." });
    }

    // ✅ Generar PDF con estilo
    const buffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Fondo gris claro
      doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f2f2f2");
      doc.fillColor("black");

      // Encabezado
      doc.fontSize(20).fillColor("#333").text("Factura", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Número: ${factura.numero_factura}`);
      doc.text(`Fecha: ${new Date(factura.fecha_emision).toLocaleDateString()}`);
      drawBlueLine(doc);

      // Datos del cliente
      doc.fontSize(12).text("Datos del cliente:", { underline: true });
      doc.moveDown();
      doc.text(`Nombre: ${cliente?.nombre || "—"} ${cliente?.apellido || ""}`);
      doc.text(`NIT: ${cliente?.nit || "—"}`);
      doc.text(`Correo: ${cliente?.correo || "—"}`);
      doc.text(`Teléfono: ${cliente?.telefono || "—"}`);
      doc.text(`Dirección: ${cliente?.direccion || "—"}`);
      drawBlueLine(doc);

      // Sucursal y vendedor
      doc.fontSize(12).text("Sucursal y vendedor:", { underline: true });
      doc.moveDown();
      doc.text(`Sucursal: ${factura.venta.sucursal?.nombre || "—"}`);
      doc.text(`Usuario: ${factura.venta.usuario?.nombre || "—"}`);
      drawBlueLine(doc);

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
      drawBlueLine(doc);

      // Total
      doc.fontSize(14).text(`Total: Q${parseFloat(factura.venta.total).toFixed(2)}`, {
        align: "right",
        underline: true
      });

      doc.end();
    });

    const pdfBase64 = buffer.toString("base64");

    // Enviar correo con Resend
    const { error } = await resend.emails.send({
      from: "FarmaPlus <no-reply@farmaciadev.online>",
      to: cliente.correo,
      subject: "Factura de tu compra",
      html: `
        <p>Hola <strong>${cliente.nombre}</strong>,</p>
        <p>Gracias por tu compra. Adjuntamos la factura correspondiente.</p>
        <p>Si tienes dudas, contáctanos a soporte@farmaciadev.online.</p>
      `,
      attachments: [
        {
          filename: "factura.pdf",
          content: pdfBase64,
          contentType: "application/pdf"
        }
      ]
    });

    if (error) {
      console.error("❌ Error al enviar factura:", error);
      return res.status(500).send({ message: "No se pudo enviar el correo." });
    }

    res.send({ message: "Factura enviada correctamente al correo del cliente." });
  } catch (err) {
    console.error("❌ Error al generar o enviar factura:", err);
    res.status(500).send({ message: "Error al procesar la solicitud." });
  }
};

// ✅ Línea azul separadora
function drawBlueLine(doc) {
  const y = doc.y + 5;
  doc.moveTo(50, y).lineTo(550, y).strokeColor("#0074D9").lineWidth(1).stroke();
  doc.moveDown();
}
