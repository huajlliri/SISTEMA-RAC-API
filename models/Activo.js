const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');

const Activo = sequelize.define('Activos', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => nanoid()
    },
    detalle: {
        type: DataTypes.STRING,
        allowNull: false
    },
    depreciacion_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha_compra: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    valor_inicial: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    valor_contabilizado: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    codigo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    empresa_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dependiente_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fecha_asignacion: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    foto: {
        type: DataTypes.STRING,
        allowNull: true
    },
    documento: {
        type: DataTypes.STRING,
        allowNull: true
    },
    placa: {
        type: DataTypes.STRING,
        allowNull: true
    },
    modelo_id: {
        type: DataTypes.STRING,
        allowNull: true
    },

});

module.exports = Activo;
