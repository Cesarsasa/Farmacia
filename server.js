// Importamos el modulo express 
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();

var corsOptions = {
 origin: "http://localhost:5173"

};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./app/models");
db.sequelize.sync({ alter: true }).then(() => {
  console.log("Base de datos sincronizada con cambios.");
});

// // drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "UMG Web Application" });
});

//require("./app/routes/tutorial.routes")(app);
require("./app/routes/cliente.routes")(app);
require("./app/routes/sucursal.routes")(app);
require("./app/routes/producto.routes")(app);
require("./app/routes/inventario.routes")(app);
require("./app/routes/auth.routes")(app);
require("./app/routes/usuario.routes")(app);
require("./app/routes/rol.routes")(app);
require("./app/routes/proveedor.routes")(app);
require("./app/routes/venta.routes")(app);
require("./app/routes/factura.routes")(app);
require("./app/routes/transaccion.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});