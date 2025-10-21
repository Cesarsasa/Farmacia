//Utilizamos module.export para exportar objetos para que puedan ser utilizados en otras clases//*
/*CREATE TABLE transaccion (
  id SERIAL PRIMARY KEY,
  id_factura INT REFERENCES factura(id),
  metodo_pago VARCHAR(50), -- efectivo, tarjeta, Stripe, PayPal
  monto NUMERIC(10,2) NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(20) DEFAULT 'completado' -- pendiente, fallido, completado
);
*/ 
module.exports = (sequelize, Sequelize) => {
// usamos el sequelize.defina para "definir" el nombre de la entity en la BD, en este caso "cliente"
// Usamos type.Sequelize para definir el tipo de datos de cada atributo de la entidad 
    const Transaccion= sequelize.define("transaccion", {
         id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },  
        id_factura: {
           type: Sequelize.INTEGER,
            allowNull: false,
             references: {
            model: 'facturas', // nombre de la tabla a la que referencia
             key: 'id'  // nombre del campo clave primaria en Cliente
                     },
                onUpdate: 'CASCADE',
             onDelete: 'SET NULL'
        },
         metodo_pago: {
            type: Sequelize.STRING,
            allowNull: false
         
     },

           monto: {
            type: Sequelize.NUMERIC(10,2),
            allowNull: false,
            

        },
          fecha: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW

        },
        estado: {
           type: Sequelize.STRING,
            allowNull: false

        }
    });
    return Transaccion;
};