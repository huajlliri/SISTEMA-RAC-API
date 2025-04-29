const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');

const Diario = sequelize.define('Diarios', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => nanoid()
  },
  empresa_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  nro: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  razon_social: {
    type: DataTypes.STRING,
    allowNull: true
  },
  glosa: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cheque_nro: {
    type: DataTypes.STRING,
    allowNull: true
  },
}, {
  hooks: {
    beforeCreate: async (diario, options) => {
      const maxCodigo = await Diario.max('nro', { where: { empresa_id:diario.empresa_id } });
      diario.nro = maxCodigo ? parseInt(maxCodigo) + 1 : 1;
    }
  }
});

module.exports = Diario;
