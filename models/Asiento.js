const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');

const Asiento = sequelize.define('Asientos', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => nanoid()
  },
  diario_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cuentaContable_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  referencia: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nro: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  debe: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  haber: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },


});

module.exports = Asiento;
