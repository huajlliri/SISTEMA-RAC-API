const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');

const ActDep = sequelize.define('ActDeps', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => nanoid()
    },
    activo_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    ufv_actual: {
        type: DataTypes.DECIMAL(20, 5),
        allowNull: false
    },
    ufv_anterior: {
        type: DataTypes.DECIMAL(20, 5),
        allowNull: false
    },
    valor_contabilizado: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    valor_actualizado: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    factor_actualizacion: {
        type: DataTypes.DECIMAL(20, 9),
        allowNull: false
    },
    incremento_por_actualizacion: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    depreciacion_acumulada_anterior: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    incremento_depreciacion_acumulada: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    depreciacion_periodo: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    depreciacion_acumulada_actualizada: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    valor_neto: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    nro: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
}, {
    hooks: {
        beforeCreate: async (actdep, options) => {
            const maxCodigo = await ActDep.max('nro', { where: { activo_id: actdep.activo_id } });
            actdep.nro = maxCodigo ? maxCodigo + 1 : 1;
        }
    }
});

module.exports = ActDep;
