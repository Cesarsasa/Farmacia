const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const hostbackend = process.env.HOST_FRONTEND ;
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Farmacia - UMG",
      version: "1.0.0",
      description: "Documentación de la API de la aplicación Farmacia con clientes, productos, ventas y más.",
    },
    servers: [
      {
        url:  `${process.env.HOST_BACKEND}/api`, // cambia el puerto si usas otro
      },
    ],
  },
  apis: ["./app/routes/*.js"], // busca anotaciones dentro de tus rutas
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger disponible en http://localhost:8082/api-docs");
}

module.exports = swaggerDocs;
