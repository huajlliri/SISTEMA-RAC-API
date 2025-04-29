const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const {nanoid} = require('nanoid');

const Proveedor = sequelize.define('Proveedores', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
       defaultValue: () => nanoid()
    },
    nit: {
        type: DataTypes.BIGINT(20),
        allowNull: false
    },
    razon_social: {
        type: DataTypes.STRING,
        allowNull: false
    },
    codigo_autorizacion: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    empresa_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    rubro: {
        type: DataTypes.STRING,
        allowNull: true
    },
    celular: {
        type: DataTypes.STRING,
        allowNull: true
    }

});

module.exports = Proveedor;
