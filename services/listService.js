const models = require("../models/Relaciones");
const { Op } = require("sequelize");

const list = async ({
  modelName,
  attributes = null,
  where = {},
  include = [],
  order = [],
  limit = null,
  offset = null,
  startDate = null,
  endDate = null,
  dateField = "createdAt",
  requiredFields = [],
  returnCount = false,
  group = null,
  having = null,
  paranoid = true,
}) => {
  const Model = models[modelName];
  if (!Model) {
    const error = new Error(`Modelo "${modelName}" no encontrado.`);
    error.statusCode = 400;
    throw error;
  }

  // Validar los campos requeridos
  for (const field of requiredFields) {
    if (!where[field]) {
      const error = new Error(`Falta el campo requerido: ${field}`);
      error.statusCode = 400;
      throw error;
    }
  }

  // Validar las fechas de rango
  if (startDate && endDate) {
    where[dateField] = {
      [Op.between]: [startDate, endDate],
    };
  }

  // Corregir la estructura de `include`
  if (Array.isArray(include)) {
    include = include.map((inc) => {
      if (typeof inc === "object" && !Array.isArray(inc)) {
        return inc;
      } else {
        throw new Error("El parámetro 'include' debe ser un arreglo de objetos válidos.");
      }
    });
  } else if (include && typeof include === "object") {
    include = [include];
  } else {
    const error = new Error("El parámetro 'include' debe ser un arreglo o un objeto.");
    error.statusCode = 400;
    throw error;
  }

  // Configuración de las opciones para Sequelize
  const options = {
    where,
    include,
    order,
    attributes,
    paranoid,
    group,
    having,
  };

  // Opciones de paginación
  if (limit != null) options.limit = limit;
  if (offset != null) options.offset = offset;

  // Si se requiere contar los registros
  if (returnCount) {
    const { count, rows } = await Model.findAndCountAll(options);
    return { count, rows };
  }

  // Obtener los registros
  const records = await Model.findAll(options);
  return records;
};

module.exports = list;
