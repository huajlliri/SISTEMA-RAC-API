const models = require('../models/Relaciones');

const registroLog = async ({ usuario, detalle, accion, empresa_id }) => {
    const Registro = models['Registro'];
    if (!Registro) throw new Error('Modelo "Registro" no encontrado.');

    await Registro.create({
        usuario,
        detalle,
        accion,
        empresa_id
    });
};

module.exports = registroLog;
