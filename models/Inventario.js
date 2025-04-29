const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');
 
const Inventario = sequelize.define('Inventarios', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => nanoid()
    },
    cantidad: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    }, 
    almacen_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    producto_id: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Inventario;
