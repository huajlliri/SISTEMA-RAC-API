const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');

const Empresa = sequelize.define('Empresa', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => nanoid()
  },
  razon_social: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  titular: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ci: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  numero_patronal: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: ''
  },
  ciudad: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: ''
  },

});

module.exports = Empresa;
