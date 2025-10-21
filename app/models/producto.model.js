
//Utilizamos module.export para exportar objetos para que puedan ser utilizados en otras clases
module.exports = (sequelize, Sequelize) => {
// usamos el sequelize.defina para "definir" el nombre de la entity en la BD, en este caso "cliente"
// Usamos type.Sequelize para definir el tipo de datos de cada atributo de la entidad 
    const Producto = sequelize.define("producto", {
         id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        descripcion: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
         precio_unitario: {
            type: Sequelize.NUMERIC(10, 2),
            allowNull: false
        },
        imagen_url: {
  type: Sequelize.STRING,
  allowNull: true
 },
          id_proveedor: {
           type: Sequelize.INTEGER,
            allowNull: false,
             references: {
            model: 'proveedors', // nombre de la tabla a la que referencia
             key: 'id'  // nombre del campo clave primaria en Cliente
                     },
                onUpdate: 'CASCADE',
             onDelete: 'SET NULL'
        }

    });
    return Producto;
};