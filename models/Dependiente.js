const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');

const Dependiente = sequelize.define('Dependientes', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => nanoid()
  },
  apellido_paterno: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellido_materno: {
    type: DataTypes.STRING,
    allowNull: false
  },
  domicilio: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nombres: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ci: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  numero_asegurado: {
    type: DataTypes.STRING,
    allowNull: true
  },
  division: {
    type: DataTypes.STRING,
    allowNull: true
  },

  nacionalidad: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  genero: {
    type: DataTypes.STRING,
    allowNull: false
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 0
  },
  cargo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fecha_ingreso: {
    type: DataTypes.STRING,
    allowNull: false
  },
  haber_basico: {
    type: DataTypes.STRING,
    allowNull: false
  },
  foto: {
    type: DataTypes.STRING,
    allowNull: true
  },
  empresa_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  aporta: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },

  cuenta_bancaria: {
    type: DataTypes.STRING,
    allowNull: true
  },
  celular: {
    type: DataTypes.STRING,
    allowNull: true
  },

  novedades: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
}, {
  hooks: {
    beforeCreate: async (dependiente, options) => {
      const { sequelize } = Dependiente;
      const maxCodigo = await Dependiente.findOne({
        where: { empresa_id: dependiente.empresa_id },
        attributes: [[sequelize.fn('MAX', sequelize.cast(sequelize.col('codigo'), 'UNSIGNED')), 'maxCodigo']]
      });

      const maxValue = maxCodigo?.dataValues?.maxCodigo || 0;
      dependiente.codigo = parseInt(maxValue) + 1;
    }
  }

});

module.exports = Dependiente;
