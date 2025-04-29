const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');
const Asistencia = sequelize.define('Asistencias', {
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
  turno: {
    type: DataTypes.STRING,
    allowNull: false
  },
  registros: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    get() {
      const valor = this.getDataValue('registros');
      return valor ? JSON.parse(valor) : null;
    },
    set(val) {
      this.setDataValue('registros', val ? JSON.stringify(val) : null);
    }
  },
  total_horas: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dias: {
    type: DataTypes.STRING,
    allowNull: false
  },

});


module.exports = Asistencia;
