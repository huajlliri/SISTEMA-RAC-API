const models = require('../models/Relaciones');
const adjustCuentaSaldo = require('./adjustCuentaSaldoService');

const createMovimientoEfectivo = async ({ 
    sucursalId,
    cuentaId,
    cuentaRefId = null,
    movimiento,
    monto,
    fecha,
    refKey,
    refId = null,
    respaldo = null,
    nroDocumento = null,
    nombre = null,
    ci = null,
    detalle = ''
}) => {
    const Efectivo = models['Efectivo'];
    if (!Efectivo) throw new Error('Modelo "Efectivo" no encontrado.');

    const efectivo = await Efectivo.create({
        sucursal_id: sucursalId,
        cuenta_id: cuentaId,
        cuenta_ref_id: cuentaRefId,
        movimiento,
        monto,
        fecha,
        ref_key: refKey,
        ingreso_id: movimiento === 'Ingreso' ? refId : null,
        gasto_id: movimiento === 'Egreso' ? refId : null,
        respaldo,
        nro_documento: nroDocumento,
        nombre,
        ci,
        detalle
    });

    if (movimiento === 'Ingreso') {
        await adjustCuentaSaldo({ cuentaId, monto: parseFloat(monto), operacion: 'sumar' });
    } else if (movimiento === 'Egreso') {
        await adjustCuentaSaldo({ cuentaId, monto: parseFloat(monto), operacion: 'restar' });
    } else if (movimiento === 'Transferencia' && cuentaRefId) {
        await adjustCuentaSaldo({ cuentaId, monto: parseFloat(monto), operacion: 'restar' });
        await adjustCuentaSaldo({ cuentaId: cuentaRefId, monto: parseFloat(monto), operacion: 'sumar' });
    }

    return efectivo;
};

module.exports = createMovimientoEfectivo;
