const { find, list, create, update, destroy, registroLog } = require("../services");
const { Op } = require('sequelize');

const ActividadController = {
  getactividades: async (req, res) => {
    try {
      const empresa_id = req.query.empresa_id;

      const actividades = await list({
        modelName: "Actividad",
        where: { empresa_id },
      });

      res.status(200).json({ actividades });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getactividadesname: async (req, res) => {
    try {
      const empresa_id = req.query.empresa_id;

      const actividades = await list({
        modelName: "Actividad",
        where: { empresa_id },
        attributes: ["nombre"],
      });

      const nombresActividades = actividades.map((actividad) => actividad.nombre);

      res.status(200).json({ actividades: nombresActividades });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addactividad: async (req, res) => {
    try {
      const { nombre, codigo, empresa_id } = req.body;

      const actividadexist = await find({
        modelName: "Actividad",
        where: { codigo, empresa_id },
      });

      if (actividadexist) {
        return res.status(400).json({ message: 'El código ya está registrado.' });
      }

      await create({
        modelName: "Actividad",
        data: { nombre, codigo, empresa_id },
      });

      await registroLog({
        usuario: req.user.nombre,
        detalle: `Creó la actividad: ${nombre}`,
        accion: "Creación",
        empresa_id,
      });

      res.status(201).json({ message: 'Actividad creada exitosamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deleteactividad: async (req, res) => {
    try {
      const { id } = req.params;

      const actividad = await find({
        modelName: "Actividad",
        id,
        failOnEmpty: true,
      });

      await registroLog({
        usuario: req.user.nombre,
        detalle: `Eliminó la actividad: ${actividad.nombre}`,
        accion: "Eliminación",
        empresa_id: actividad.empresa_id,
      });

      await destroy({
        modelName: "Actividad",
        id,
      });

      res.status(200).json({ message: 'Eliminación exitosa.' });
    } catch (error) {
      if (
        error.name === 'SequelizeForeignKeyConstraintError' ||
        error.message.includes('a foreign key constraint fails')
      ) {
        res.status(400).json({ message: 'Este registro tiene dependencias y no puede ser eliminado.' });
      } else {
        console.error(error);
        res.status(error.statusCode || 500).json({ message: error.message });
      }
    }
  },

  editactividad: async (req, res) => {
    try {
      const { id, nombre, codigo, empresa_id } = req.body;

      const actividad = await find({
        modelName: "Actividad",
        id,
        failOnEmpty: true,
      });

      const actividadexist = await find({
        modelName: "Actividad",
        where: {
          codigo,
          empresa_id,
          id: { [Op.ne]: id },
        },
      });

      if (actividadexist) {
        return res.status(400).json({ message: 'El código ya está registrado.' });
      }

      await update({
        modelName: "Actividad",
        id,
        data: { nombre, codigo },
      });

      res.status(200).json({ message: 'Registro actualizado exitosamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

module.exports = ActividadController;
