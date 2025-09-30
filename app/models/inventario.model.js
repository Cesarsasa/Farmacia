module.exports = (sequelize, Sequelize) => {
    const Inventario = sequelize.define("inventario", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        cantidad: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                min: 0
            }
        },  
        
        id_producto: {
           type: Sequelize.INTEGER,
            allowNull: false,
             references: {
            model: 'productos', // nombre de la tabla a la que referencia
             key: 'id'  // nombre del campo clave primaria en Cliente
                     },
                onUpdate: 'CASCADE',
             onDelete: 'SET NULL'
        },
        id_sucursal: {
           type: Sequelize.INTEGER,
            allowNull: false,
             references: {
            model: 'sucursals', // nombre de la tabla a la que referencia
             key: 'id'  // nombre del campo clave primaria en Cliente
                     },
                onUpdate: 'CASCADE',
             onDelete: 'SET NULL'
        }
    });

    // Relaciones (asumiendo que los modelos producto y sucursal están definidos en otro archivo

    return Inventario;
};