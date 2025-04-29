const models = require("../models/Relaciones");
const bcrypt = require("bcrypt");

const bulkCreate = async ({
  modelName,
  data = [],
  prepare = [],
  options = {},
}) => {
  const Model = models[modelName];
  if (!Model) {
    const error = new Error(`Modelo "${modelName}" no encontrado.`);
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(data) || data.length === 0) {
    const error = new Error("Debe proporcionar un array de datos no vacío.");
    error.statusCode = 400;
    throw error;
  }

  for (const item of data) {
    if (typeof item !== "object" || Array.isArray(item) || item === null) {
      const error = new Error("Cada elemento de 'data' debe ser un objeto válido.");
      error.statusCode = 400;
      throw error;
    }
  }

  if (prepare.length > 0) {
    for (const item of data) {
      for (const action of prepare) {
        if (action === "hashPassword" && item.password) {
          item.password = await bcrypt.hash(item.password, 10);
        }
      }
    }
  }

  try {
    const createdRecords = await Model.bulkCreate(data, {
      validate: true,
      ...options,
    });
    return createdRecords;
  } catch (err) {
    console.error(`Error al realizar bulkCreate en modelo "${modelName}":`, err.message);
    const error = new Error(`Error al crear registros en ${modelName}.`);
    error.statusCode = 500;
    throw error;
  }
};

module.exports = bulkCreate;
