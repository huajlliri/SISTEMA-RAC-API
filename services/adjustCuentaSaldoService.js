const models = require('../models/Relaciones');

const adjustCuentaSaldo = async ({ cuenta_id, monto, operacion = 'sumar' }) => {
    const Cuenta = models['Cuenta'];
    if (!Cuenta) throw new Error('Modelo "Cuenta" no encontrado.');

    const cuenta = await Cuenta.findByPk(cuenta_id);
    if (!cuenta) throw new Error('Cuenta no encontrada.');

    const montoAjustado = parseFloat(monto);

    if (isNaN(montoAjustado)) {
        throw new Error('El monto proporcionado no es un número válido.');
    }

    if (operacion === 'sumar') {
        cuenta.saldo = (parseFloat(cuenta.saldo) + montoAjustado).toFixed(2);
    } else if (operacion === 'restar') {
        cuenta.saldo = (parseFloat(cuenta.saldo) - montoAjustado).toFixed(2);
    } else {
        throw new Error('Operación inválida. Use "sumar" o "restar".');
    }

    await cuenta.save();
    return cuenta;
};

module.exports = adjustCuentaSaldo;
