const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const {nanoid} = require('nanoid');

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
   defaultValue: () => nanoid()
  },
  nit_ci_cex: {
    type: DataTypes.BIGINT(20),
    allowNull: false
  },
  complemento: {
    type: DataTypes.STRING,
    allowNull: false
  },
  razon_social: {
    type: DataTypes.STRING,
    allowNull: false
  },
  empresa_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  celular: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Cliente;
