const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');
const Indem = sequelize.define('Indems', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => nanoid()
  },
  dependiente_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  periodo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dias: {
    type: DataTypes.STRING,
    allowNull: false
  },
  meses: {
    type: DataTypes.STRING,
    allowNull: false
  },
  años: {
    type: DataTypes.STRING,
    allowNull: false
  },


  sueldo_ult: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  sueldo_pen: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  sueldo_ant: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  sueldo_pro: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  pagos: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  indem_mes: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  indem_acumulada: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
});


module.exports = Indem;
