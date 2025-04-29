const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const {nanoid} = require('nanoid');

const Cuenta = sequelize.define('Cuentas', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
       defaultValue: () => nanoid()
    },
    sucursal_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    detalle: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    saldo: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
});

module.exports = Cuenta;
