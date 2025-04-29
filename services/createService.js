const models = require("../models/Relaciones");
const bcrypt = require("bcrypt");

const create = async ({
  modelName,
  data,
  validate = [],
  prepare = [],
  relate = [],
  options = {},
}) => {
  const Model = models[modelName];
  if (!Model) throw new Error(`Modelo "${modelName}" no encontrado.`);

  for (const rule of validate) {
    if (rule.unique) {
      const where = {
        ...(rule.where || {}),
        [rule.field]: rule.caseInsensitive && typeof data[rule.field] === "string"
          ? data[rule.field].toLowerCase()
          : data[rule.field],
      };

      const queryOptions = { where };
      if (rule.caseInsensitive) {
        queryOptions.attributes = [rule.field];
      }

      const exists = await Model.findOne(queryOptions);
      if (exists) {
        const error = new Error(rule.errorMessage || `El valor de ${rule.field} ya está registrado.`);
        error.statusCode = 400;
        throw error;
      }
    }
  }

  for (const action of prepare) {
    if (action === "hashPassword" && data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
  }

  const created = await Model.create(data, options);

  for (const rel of relate) {
    if (data[rel.field] && typeof created[rel.method] === "function") {
      await created[rel.method](data[rel.field]);
    }
  }

  return created;
};

module.exports = create;
