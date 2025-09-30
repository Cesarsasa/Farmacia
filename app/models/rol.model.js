module.exports = (sequelize, Sequelize) => {

    const Rol = sequelize.define("rol", {
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
        }
    });
    return Rol;
};