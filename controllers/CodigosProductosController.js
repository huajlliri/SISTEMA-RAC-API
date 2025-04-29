const { find, list, create, update, destroy, registroLog } = require("../services");
const { Op } = require('sequelize');

const CodigosProductosController = {
  getcodigosProductos: async (req, res) => {
    try {
      const { empresa_id } = req.query;

      const codigosProductos = await list({
        modelName: "CodigosProductos",
        where: { empresa_id },
      });

      res.status(200).json({ codigosProductos });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getcodigosProductosname: async (req, res) => {
    try {
      const { empresa_id } = req.query;

      const codigosProductos = await list({
        modelName: "CodigosProductos",
        where: { empresa_id },
        attributes: ["descripcion"],
      });

      const nombrescodigosProductos = codigosProductos.map(cp => cp.descripcion);

      res.status(200).json({ codigosProductos: nombrescodigosProductos });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getcodigosProductosvalores: async (req, res) => {
    try {
      const { empresa_id } = req.query;

      const codigosProductos = await list({
        modelName: "CodigosProductos",
        where: { empresa_id },
        attributes: ["descripcion", "id", "codigo_producto_sin", "codigo_actividad_caeb"],
      });

      const nombrescodigosProductos = codigosProductos.map(cp => cp.descripcion);

      res.status(200).json({ codigosProductos: nombrescodigosProductos });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  AddcodigosProductosLote: async (req, res) => {
    try {
      const { codigosProductos, empresa_id } = req.body;
      let aceptados = 0;

      for (const item of codigosProductos) {
        const exist = await find({
          modelName: "CodigosProductos",
          where: { codigo_producto_sin: item.codigo_producto_sin, empresa_id },
        });

        if (!exist && item.codigo_producto_sin) {
          await create({
            modelName: "CodigosProductos",
            data: {
              codigo_producto_sin: item.codigo_producto_sin,
              codigo_actividad_caeb: item.codigo_actividad_caeb,
              descripcion: item.descripcion,
              empresa_id,
            },
          });
          aceptados++;
        }
      }

      if (aceptados > 0) {
        await registroLog({
          usuario: req.user.nombre,
          detalle: `Añadió ${aceptados} Unidades de medida`,
          accion: "Creación",
          empresa_id,
        });
      }

      res.status(201).json({ message: `${aceptados} Unidades de medida creadas exitosamente.` });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addcodigosProducto: async (req, res) => {
    try {
      const { codigo_producto_sin, codigo_actividad_caeb, descripcion, empresa_id } = req.body;

      const codigosProductoexist = await find({
        modelName: "CodigosProductos",
        where: { codigo_producto_sin, empresa_id },
      });

      if (codigosProductoexist) {
        return res.status(400).json({ message: 'El código ya está registrado.' });
      }

      await create({
        modelName: "CodigosProductos",
        data: { codigo_producto_sin, codigo_actividad_caeb, descripcion, empresa_id },
      });

      await registroLog({
        usuario: req.user.nombre,
        detalle: `Creó el código de producto: ${codigo_producto_sin}`,
        accion: "Creación",
        empresa_id,
      });

      res.status(201).json({ message: 'Código de producto creado exitosamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deletecodigosProducto: async (req, res) => {
    try {
      const { id } = req.params;

      const codigosProducto = await find({
        modelName: "CodigosProductos",
        id,
        failOnEmpty: true,
      });

      await registroLog({
        usuario: req.user.nombre,
        detalle: `Eliminó el código de producto: ${codigosProducto.codigo_producto_sin}`,
        accion: "Eliminación",
        empresa_id: codigosProducto.empresa_id,
      });

      await destroy({
        modelName: "CodigosProductos",
        id,
      });

      res.status(200).json({ message: 'Código de producto eliminado correctamente.' });
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

  editcodigosProducto: async (req, res) => {
    try {
      const { id, codigo_producto_sin, codigo_actividad_caeb, descripcion, empresa_id } = req.body;

      const codigosProducto = await find({
        modelName: "CodigosProductos",
        id,
        failOnEmpty: true,
      });

      const codigosProductoexist = await find({
        modelName: "CodigosProductos",
        where: {
          codigo_producto_sin,
          empresa_id,
          id: { [Op.ne]: id },
        },
      });

      if (codigosProductoexist) {
        return res.status(400).json({ message: 'El código ya está registrado.' });
      }

      await update({
        modelName: "CodigosProductos",
        id,
        data: { codigo_producto_sin, codigo_actividad_caeb, descripcion },
      });

      res.status(200).json({ message: 'Código de producto actualizado exitosamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

module.exports = CodigosProductosController;
