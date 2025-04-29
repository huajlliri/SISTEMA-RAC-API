const models = require("../models/Relaciones");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { Op } = require("sequelize");

const update = async ({
  modelName,
  id,
  data,
  validate = [],
  prepare = [],
  relate = [],
  customValidations = [],
  files = [],
  fileDelete = [],
  uploadPath = "",
  options = {},
}) => {
  const Model = models[modelName];
  if (!Model) throw new Error(`Modelo "${modelName}" no encontrado.`);
  if (!id) throw new Error("ID requerido para actualizar.");

  const record = await Model.findByPk(id, options);
  if (!record) {
    const error = new Error("Registro no encontrado.");
    error.statusCode = 404;
    throw error;
  }

  for (const rule of validate) {
    if (rule.unique) {
      const where = {
        ...(rule.where || {}),
        [rule.field]: rule.caseInsensitive && typeof data[rule.field] === "string"
          ? data[rule.field].toLowerCase()
          : data[rule.field],
        [Model.primaryKeyAttribute || "id"]: { [Op.ne]: id },
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

  for (const validation of customValidations) {
    await validation(record, data);
  }

  for (const action of prepare) {
    if (action === "hashPassword" && data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
  }

  for (const del of fileDelete) {
    const currentPath = record[del.field];
    if (currentPath) {
      const fullPath = path.join(uploadPath, path.basename(currentPath));
      try {
        await fs.promises.unlink(fullPath);
      } catch (error) {
        console.error(`Error eliminando archivo antiguo: ${error.message}`);
      }
      record[del.field] = null;
    }
  }

  for (const file of files) {
    if (file.data) {
      const imageName = `${id}-${file.name}.webp`;
      const imagePath = path.join(uploadPath, imageName);

      await sharp(file.data, { failOnError: false })
        .resize({ width: 1500, height: 1500, fit: "inside" })
        .webp({ quality: 90 })
        .toFile(imagePath);

      data[file.field] = "logos/" + imageName;
    }
  }

  await record.update(data, options);

  for (const rel of relate) {
    if (data[rel.field] !== undefined && typeof record[rel.method] === "function") {
      await record[rel.method](data[rel.field]);
    }
  }

  return record;
};

module.exports = update;
