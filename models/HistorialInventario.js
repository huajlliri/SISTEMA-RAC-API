const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');

const HistorialInventario = sequelize.define('HistorialInventarios', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => nanoid()
    },
    nro: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0
    },
    almacen_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    almacen_ref_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    producto_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cantidad: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    nro_documento: {
        type: DataTypes.STRING,
        allowNull: true
    },
    observaciones: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, {
    hooks: {
        beforeCreate: async (historial) => {
            const lastHistorial = await HistorialInventario.findOne({
                where: {
                    almacen_id: historial.almacen_id, 
                    producto_id: historial.producto_id
                },
                order: [['nro', 'DESC']]
            });
            if (lastHistorial) {
                historial.nro = lastHistorial.nro + 1;
            } else {
                historial.nro = 1;
            }
        }
    }
})

module.exports = HistorialInventario;
