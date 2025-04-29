const models = require("../models/Relaciones");

const destroy = async ({ modelName, id = null, where = null, options = {} }) => {
  const Model = models[modelName];
  if (!Model) {
    const error = new Error(`Modelo "${modelName}" no encontrado.`);
    error.statusCode = 400;
    throw error;
  }

  if (!id && !where) {
    const error = new Error("Debe proporcionar 'id' o 'where' para eliminar.");
    error.statusCode = 400;
    throw error;
  }

  try {
    if (id) {
      const record = await Model.findByPk(id);
      if (!record) {
        const error = new Error(`${modelName} no encontrado.`);
        error.statusCode = 404;
        throw error;
      }
      await record.destroy(options);
    } else if (where) {
      const deletedCount = await Model.destroy({ where, ...options });
      if (deletedCount === 0) {
        const error = new Error(`No se encontró ningún registro para eliminar en ${modelName}.`);
        error.statusCode = 404;
        throw error;
      }
    }
  } catch (error) {
    if (error.name === "SequelizeForeignKeyConstraintError") {
      const newError = new Error(
        "Este registro tiene dependencias y no puede ser eliminado."
      );
      newError.statusCode = 400;
      throw newError;
    }
    throw error;
  }
};

module.exports = destroy;
