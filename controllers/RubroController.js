const { create, update, destroy, find, list, bulkCreate } = require("../services");
const { Op } = require("sequelize");

const RubroController = {
  getrubros: async (req, res) => {
    try {
      const { empresa_id } = req.query;

      const rubros = await list({
        modelName: "Rubro",
        where: { empresa_id },
      });

      res.status(200).json({
        success: true,
        data: { rubros },
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getrubrosname: async (req, res) => {
    try {
      const { empresa_id } = req.query;

      const rubros = await list({
        modelName: "Rubro",
        attributes: ["nombre"],
        where: { empresa_id },
      });

      const nombresRubros = rubros.map((r) => r.nombre);

      res.status(200).json({
        success: true,
        data: { rubros: nombresRubros },
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addrubro: async (req, res) => {
    try {
      const { nombre, empresa_id } = req.body;

      await create({
        modelName: "Rubro",
        data: { nombre, empresa_id },
        validate: [
          {
            field: "nombre",
            unique: true,
            where: { empresa_id },
          },
        ],
      });

      await create({
        modelName: "Registro",
        data: {
          usuario: req.user.nombre,
          detalle: `Creó el Rubro: ${nombre}`,
          accion: "Creación",
          empresa_id,
        },
      });

      res.status(201).json({
        success: true,
        message: "Rubro creado exitosamente.",
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  AddRubrosLote: async (req, res) => {
    try {
      const { rubros, empresa_id } = req.body;
  
      if (!Array.isArray(rubros) || rubros.length === 0) {
        return res.status(400).json({ message: "Debe proporcionar datos válidos." });
      }
  
      const nombres = rubros.filter(Boolean);
  
      const existentes = await list({
        modelName: "Rubro",
        where: {
          nombre: { [Op.in]: nombres },
          empresa_id,
        },
        attributes: ["nombre"],
      });
  
      const nombresExistentes = new Set(existentes.map((item) => item.nombre));
  
      const nuevos = rubros
        .filter((nombre) => nombre && !nombresExistentes.has(nombre))
        .map((nombre) => ({
          nombre,
          empresa_id,
        }));
  
      if (nuevos.length > 0) {
        await bulkCreate({
          modelName: "Rubro",
          data: nuevos,
        });
  
        await create({
          modelName: "Registro",
          data: {
            usuario: req.user.nombre,
            detalle: `Añadió ${nuevos.length} rubros`,
            accion: "Creación",
            empresa_id,
          },
        });
      }
  
      res.status(201).json({
        success: true,
        message: `${nuevos.length} rubros creados exitosamente.`,
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
  

  deleterubro: async (req, res) => {
    try {
      const { id } = req.params;

      const rubro = await find({
        modelName: "Rubro",
        id,
        failOnEmpty: true,
      });

      await create({
        modelName: "Registro",
        data: {
          usuario: req.user.nombre,
          detalle: `Eliminó el Rubro: ${rubro.nombre}`,
          accion: "Eliminación",
          empresa_id: rubro.empresa_id,
        },
      });

      await destroy({
        modelName: "Rubro",
        id,
      });

      res.status(200).json({
        success: true,
        message: "Rubro eliminado exitosamente.",
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editrubro: async (req, res) => {
    try {
      const { id, nombre, empresa_id } = req.body;

      await find({
        modelName: "Rubro",
        id,
        failOnEmpty: true,
      });

      await update({
        modelName: "Rubro",
        id,
        data: { nombre },
        validate: [
          {
            field: "nombre",
            unique: true,
            where: { empresa_id },
            excludeId: id,
          },
        ],
      });

      res.status(200).json({
        success: true,
        message: "Rubro actualizado exitosamente.",
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

module.exports = RubroController;
