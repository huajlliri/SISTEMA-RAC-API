const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');

const CuentaContable = sequelize.define('CuentasContables', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => nanoid()
  },
  nro: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  flujo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  rubro: {
    type: DataTypes.STRING,
    allowNull: true
  },
  moneda: {
    type: DataTypes.STRING,
    allowNull: true
  },
  empresa_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
});

module.exports = CuentaContable;
