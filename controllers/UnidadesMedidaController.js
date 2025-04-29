const { create, update, destroy, list, find } = require("../services");
const models = require("../models/Relaciones");
const { Op } = require("sequelize");

const UnidadesMedidaController = {
  getUnidadesMedida: async (req, res) => {
    try {
      const { empresa_id } = req.query;

      const unidadesMedidas = await list({
        modelName: "UnidadesMedida",
        where: { empresa_id },
      });

      res.status(200).json({
        success: true,
        data: { unidadesMedidas },
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getUnidadesMedidaName: async (req, res) => {
    try {
      const { empresa_id } = req.query;

      const unidadesMedida = await list({
        modelName: "UnidadesMedida",
        attributes: ["descripcion"],
        where: { empresa_id },
      });

      const nombresUnidades = unidadesMedida.map((u) => u.descripcion);

      res.status(200).json({
        success: true,
        data: { unidadesMedida: nombresUnidades },
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addUnidadesMedida: async (req, res) => {
    try {
      await create({
        modelName: "UnidadesMedida",
        data: req.body,
        validate: [
          {
            field: "codigo",
            unique: true,
            where: { empresa_id: req.body.empresa_id },
          },
        ],
      });

      await create({
        modelName: "Registro",
        data: {
          usuario: req.user.nombre,
          detalle: `Creó la unidad de medida: ${req.body.codigo}`,
          accion: "Creación",
          empresa_id: req.body.empresa_id,
        },
      });

      res.status(201).json({ message: "Unidad de medida creada exitosamente" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  AddUnidadesMedidaLote: async (req, res) => {
    try {
      const { unidadesMedidas, empresa_id } = req.body;
  
      if (!Array.isArray(unidadesMedidas) || unidadesMedidas.length === 0) {
        return res.status(400).json({ message: "Debe proporcionar datos válidos." });
      }
  
      const codigos = unidadesMedidas.map((item) => item.codigo).filter(Boolean);
  
      const existentes = await list({
        modelName: "UnidadesMedida",
        where: {
          codigo: { [Op.in]: codigos },
          empresa_id,
        },
        attributes: ["codigo"],
      });
  
      const codigosExistentes = new Set(existentes.map((item) => item.codigo));
  
      const nuevos = unidadesMedidas
        .filter((item) => item.codigo && !codigosExistentes.has(item.codigo))
        .map((item) => ({
          codigo: item.codigo,
          descripcion: item.descripcion,
          empresa_id,
        }));
  
      if (nuevos.length > 0) {
        await bulkCreate({
          modelName: "UnidadesMedida",
          data: nuevos,
        });
  
        await create({
          modelName: "Registro",
          data: {
            usuario: req.user.nombre,
            detalle: `Añadió ${nuevos.length} Unidades de medida`,
            accion: "Creación",
            empresa_id,
          },
        });
      }
  
      res.status(201).json({
        success: true,
        message: `${nuevos.length} unidades de medida creadas exitosamente.`,
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
  

  deleteUnidadMedida: async (req, res) => {
    try {
      const { id } = req.params;

      const unidadMedida = await find({
        modelName: "UnidadesMedida",
        id,
        failOnEmpty: true,
      });

      await create({
        modelName: "Registro",
        data: {
          usuario: req.user.nombre,
          detalle: `Eliminó la unidad de medida: ${unidadMedida.codigo}`,
          accion: "Eliminación",
          empresa_id: unidadMedida.empresa_id,
        },
      });

      await destroy({
        modelName: "UnidadesMedida",
        id,
      });

      res.status(200).json({ message: "Eliminación exitosa" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editUnidadMedida: async (req, res) => {
    try {
      const { id, codigo, descripcion, empresa_id } = req.body;

      await update({
        modelName: "UnidadesMedida",
        id,
        data: { codigo, descripcion },
        validate: [
          {
            field: "codigo",
            unique: true,
            where: { empresa_id },
            excludeId: id,
          },
        ],
      });

      res.status(200).json({ message: "Dato actualizado exitosamente" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};
module.exports = UnidadesMedidaController;
