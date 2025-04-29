const { find, list, create, update, destroy, registroLog } = require("../services");
const { Op } = require('sequelize');

const AlmacenController = {
  getalmacenes: async (req, res) => {
    try {
      const empresa_id = req.query.empresa_id;

      const almacenes = await list({
        modelName: "Almacen",
        where: { empresa_id },
      });

      res.status(200).json({ almacenes });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addalmacen: async (req, res) => {
    try {
      const { nombre, codigo, empresa_id } = req.body;

      const exist = await find({
        modelName: "Almacen",
        where: { codigo, empresa_id },
      });

      if (exist) {
        return res.status(400).json({ message: 'El valor ya está registrado.' });
      }

      await create({
        modelName: "Almacen",
        data: { nombre, codigo, empresa_id },
      });

      await registroLog({
        usuario: req.user.nombre,
        detalle: `Creó el Almacen: ${nombre}`,
        accion: "Creación",
        empresa_id,
      });

      res.status(201).json({ message: 'Almacen creado exitosamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editalmacen: async (req, res) => {
    try {
      const { id, nombre, codigo, empresa_id } = req.body;

      const almacen = await find({
        modelName: "Almacen",
        id,
        failOnEmpty: true,
      });

      const exist = await find({
        modelName: "Almacen",
        where: {
          codigo,
          empresa_id,
          id: { [Op.ne]: id },
        },
      });

      if (exist) {
        return res.status(400).json({ message: 'El Almacen ya está registrado.' });
      }

      await update({
        modelName: "Almacen",
        id,
        data: { nombre, codigo },
      });

      res.status(200).json({ message: 'Almacen actualizado exitosamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deletealmacen: async (req, res) => {
    try {
      const { id } = req.params;

      const almacen = await find({
        modelName: "Almacen",
        id,
        failOnEmpty: true,
      });

      await registroLog({
        usuario: req.user.nombre,
        detalle: `Eliminó el Almacen: ${almacen.nombre}`,
        accion: "Eliminación",
        empresa_id: almacen.empresa_id,
      });

      await destroy({
        modelName: "Almacen",
        id,
      });

      res.status(200).json({ message: 'Eliminación exitosa.' });
    } catch (error) {
      if (
        error.name === "SequelizeForeignKeyConstraintError" ||
        error.message.includes("a foreign key constraint fails")
      ) {
        res.status(400).json({ message: 'Este registro tiene dependencias y no puede ser eliminado.' });
      } else {
        console.error(error);
        res.status(error.statusCode || 500).json({ message: error.message });
      }
    }
  },

  getrubrosname: async (req, res) => {
    try {
      const empresa_id = req.query.empresa_id;

      const rubros = await list({
        modelName: "Almacen",
        where: { empresa_id },
        attributes: ["nombre"],
      });

      const nombresRubros = rubros.map((rubro) => rubro.nombre);

      res.status(200).json({ rubros: nombresRubros });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

module.exports = AlmacenController;
