const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => nanoid()
  },
  codigo_producto_sin: {
    type: DataTypes.STRING,
    allowNull: false
  }, 
  codigo_actividad_caeb: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion_producto_sin: {
    type: DataTypes.STRING,
    allowNull: false
  },
  empresa_id: {
    type: DataTypes.STRING,
    allowNull: false
  }, 
  sublinea_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  codigo_producto_contribuyente: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion_producto_contribuyente: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  unidad_medida: {
    type: DataTypes.STRING,
    allowNull: false
  },
  precio_venta: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    get() {
      const valor = this.getDataValue('precio_venta');
      return valor ? JSON.parse(valor) : null;
    },
    set(val) {
      this.setDataValue('precio_venta', val ? JSON.stringify(val) : null);
    }
  },

  precio_costo: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  linea: {
    type: DataTypes.STRING,
    allowNull: true
  },
  marca: {
    type: DataTypes.STRING,
    allowNull: true
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tipo: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    get() {
      const valor = this.getDataValue('tipo');
      return valor ? JSON.parse(valor) : null;
    },
    set(val) {
      this.setDataValue('tipo', val ? JSON.stringify(val) : null);
    }
  },
  caracteristicas: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    get() {
      const valor = this.getDataValue('caracteristicas');
      return valor ? JSON.parse(valor) : null;
    },
    set(val) {
      this.setDataValue('caracteristicas', val ? JSON.stringify(val) : null);
    }
  },
  observaciones: {
    type: DataTypes.STRING,
    allowNull: true
  },
});

module.exports = Producto;
