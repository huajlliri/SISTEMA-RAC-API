const models = require('../models/Relaciones');

const createCuentaSaldoInicial = async ({ cuentaId, sucursalId, fecha }) => {
    const Efectivo = models['Efectivo'];
    if (!Efectivo) throw new Error('Modelo "Efectivo" no encontrado.');

    await Efectivo.create({
        sucursal_id: sucursalId,
        cuenta_id: cuentaId,
        ref_id: null,
        ref_key: 'SALDO INICIAL',
        detalle: '',
        fecha: fecha,
        monto: 0.00,
        movimiento: 'Ingreso',
        cuenta_ref_id: null,
        respaldo: null,
        nro_documento: null
    });
};

module.exports = createCuentaSaldoInicial;
