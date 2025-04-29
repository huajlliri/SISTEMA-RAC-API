const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');
const Patronal = sequelize.define('Patronales', {
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
  total_ganado: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  }, 
  total_aportes: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  }, 
  prov_aguinaldo: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  }, 
  prov_seg_aguinaldo: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  }, 
  prov_indem: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  }, 
  total_cargas: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  }, 
  costo_total: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },

  CNS: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false
  },
  PNSV: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false
  },
  APS: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false
  },
  RP: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false
  },

});


module.exports = Patronal;
 