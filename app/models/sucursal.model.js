//Utilizamos module.export para exportar objetos para que puedan ser utilizados en otras clases
module.exports = (sequelize, Sequelize) => {
// usamos el sequelize.defina para "definir" el nombre de la entity en la BD, en este caso "cliente"
// Usamos type.Sequelize para definir el tipo de datos de cada atributo de la entidad 
    const Sucursal = sequelize.define("sucursal", {
         id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        direccion: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        telefono: {
            type: Sequelize.STRING(100),
            allowNull: false
        }

    });
    return Sucursal;
};