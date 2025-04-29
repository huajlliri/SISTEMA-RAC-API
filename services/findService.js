const models = require("../models/Relaciones");

const find = async ({
  modelName,
  id = null,
  where = null,
  include = [], // Asegúrate de que este 'include' sea un arreglo de objetos válidos
  attributes = null,
  options = {},
  failOnEmpty = false,
  paranoid = true,
}) => {
  const Model = models[modelName];
  if (!Model) {
    const error = new Error(`Modelo "${modelName}" no encontrado.`);
    error.statusCode = 400;
    throw error;
  }

  if (!id && !where) {
    const error = new Error("Debe proporcionar 'id' o 'where'.");
    error.statusCode = 400;
    throw error;
  }

  // Validación de include
  if (Array.isArray(include)) {
    include = include.map((inc) => {
      if (typeof inc === "object" && !Array.isArray(inc)) {
        return inc; // Asegúrate de que cada elemento de include sea un objeto válido
      } else {
        throw new Error("El parámetro 'include' debe ser un arreglo de objetos válidos.");
      }
    });
  } else if (include && typeof include === "object") {
    include = [include]; // Si es un solo objeto, convertirlo en un array
  } else {
    const error = new Error("El parámetro 'include' debe ser un arreglo o un objeto.");
    error.statusCode = 400;
    throw error;
  }

  const findOptions = {
    include,
    attributes,
    paranoid,
    ...options,
  };

  let record = null;

  if (id) {
    record = await Model.findByPk(id, findOptions);
  } else {
    record = await Model.findOne({ where, ...findOptions });
  }

  if (failOnEmpty && !record) {
    const modelDisplayName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
    const error = new Error(`${modelDisplayName} no encontrado.`);
    error.statusCode = 404;
    throw error;
  }

  return record;
};

module.exports = find;
