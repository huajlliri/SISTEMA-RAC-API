const models = require('../models/Relaciones');
const adjustCuentaSaldo = require('./adjustCuentaSaldoService');

const deleteMovimientoEfectivo = async ({ id }) => {
    const Efectivo = models['Efectivo'];
    if (!Efectivo) throw new Error('Modelo "Efectivo" no encontrado.');

    const efectivo = await Efectivo.findByPk(id);
    if (!efectivo) throw new Error('Movimiento de efectivo no encontrado.');

    const { cuenta_id, cuenta_ref_id, monto, movimiento } = efectivo;

    if (movimiento === 'Ingreso') {
        await adjustCuentaSaldo({ cuentaId: cuenta_id, monto: parseFloat(monto), operacion: 'restar' });
    } else if (movimiento === 'Egreso') {
        await adjustCuentaSaldo({ cuentaId: cuenta_id, monto: parseFloat(monto), operacion: 'sumar' });
    } else if (movimiento === 'Transferencia') {
        await adjustCuentaSaldo({ cuentaId: cuenta_id, monto: parseFloat(monto), operacion: 'sumar' });
        if (cuenta_ref_id) {
            await adjustCuentaSaldo({ cuentaId: cuenta_ref_id, monto: parseFloat(monto), operacion: 'restar' });
        }
    }

    await efectivo.destroy();

    return { message: 'Movimiento eliminado exitosamente.' };
};

module.exports = deleteMovimientoEfectivo;
