const { find, list, create, update, destroy, registroLog, uploadFile, deleteFile } = require("../services");
const path = require('path');
const { Op } = require('sequelize');
const { nanoid } = require('nanoid');
const models = require('../models/Relaciones');

const uploadPath = path.resolve(__dirname, '../public/productos');

const ProductoController = {
  getproductosInventario: async (req, res) => {
    try {
      const { empresa_id } = req.query;

      const productos = await list({
        modelName: "Producto",
        where: { empresa_id },
      });

      res.status(200).json({ productos });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getproductos: async (req, res) => {
    try {
      const { empresa_id } = req.query;

      const productos = await list({
        modelName: "Producto",
        where: { empresa_id },
        include: [{
          model: models.SubLinea,
          as: "sublinea",
          include: [{ model: models.Linea, as: "linea" }],
        }],
      });

      res.status(200).json({ productos });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addproducto: async (req, res) => {
    try {
      const {
        empresa_id,
        codigo_producto_contribuyente,
        descripcion_producto_contribuyente,
        unidadesMedidaSelected,
        precio_costo,
        marca,
        sublinea_id,
        observaciones,
      } = req.body;

      const precio_venta = JSON.parse(req.body.precio_venta);
      const tipo = JSON.parse(req.body.tipo);
      const actividad = JSON.parse(req.body.actividad);
      const caracteristicas = JSON.parse(req.body.caracteristicas);

      const exist = await find({
        modelName: "Producto",
        where: { codigo_producto_contribuyente, empresa_id },
      });

      if (exist) {
        return res.status(400).json({ message: 'El código de producto ya está registrado.' });
      }

      const producto = await create({
        modelName: "Producto",
        data: {
          empresa_id,
          codigo_producto_sin: actividad.codigo_producto_sin,
          codigo_actividad_caeb: actividad.codigo_actividad_caeb,
          descripcion_producto_sin: actividad.descripcion,
          codigo_producto_contribuyente,
          descripcion_producto_contribuyente,
          unidad_medida: unidadesMedidaSelected,
          precio_costo,
          marca,
          sublinea_id: sublinea_id !== 'null' ? sublinea_id : null,
          observaciones,
          precio_venta,
          tipo,
          caracteristicas,
        },
      });

      if (req.files?.imagen) {
        const imageName = producto.id + nanoid() + ".webp";
        await uploadFile({
          fileData: req.files.imagen.data,
          targetPath: uploadPath,
          fileName: imageName,
          resizeOptions: { width: 1500, height: 1500, fit: 'inside' },
        });

        await update({
          modelName: "Producto",
          id: producto.id,
          data: { imagen: 'productos/' + imageName },
        });
      }

      await registroLog({
        usuario: req.user.nombre,
        detalle: `Creó el Producto: ${codigo_producto_contribuyente}`,
        accion: "Creación",
        empresa_id,
      });

      res.status(201).json({ message: 'Producto creado exitosamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editproducto: async (req, res) => {
    try {
      const {
        id,
        sublinea_id,
        codigo_producto_contribuyente,
        descripcion_producto_contribuyente,
        unidad_medida,
        precio_costo,
        marca,
        observaciones,
      } = req.body;

      const precio_venta = JSON.parse(req.body.precio_venta);
      const tipo = JSON.parse(req.body.tipo);
      const caracteristicas = JSON.parse(req.body.caracteristicas);

      const producto = await find({
        modelName: "Producto",
        id,
        failOnEmpty: true,
      });

      const exist = await find({
        modelName: "Producto",
        where: {
          codigo_producto_contribuyente,
          empresa_id: producto.empresa_id,
          id: { [Op.ne]: id },
        },
      });

      if (exist) {
        return res.status(400).json({ message: 'El código de producto ya está registrado.' });
      }

      await update({
        modelName: "Producto",
        id: producto.id,
        data: {
          codigo_producto_contribuyente,
          descripcion_producto_contribuyente,
          unidad_medida,
          precio_costo,
          marca,
          observaciones,
          sublinea_id,
          precio_venta,
          tipo,
          caracteristicas,
        },
      });

      if (producto.imagen) {
        await deleteFile({ targetPath: uploadPath, fileName: path.basename(producto.imagen) });
        await update({
          modelName: "Producto",
          id: producto.id,
          data: { imagen: null },
        });
      }

      if (req.files?.imagen) {
        const imageName = producto.id + nanoid() + ".webp";
        await uploadFile({
          fileData: req.files.imagen.data,
          targetPath: uploadPath,
          fileName: imageName,
          resizeOptions: { width: 1500, height: 1500, fit: 'inside' },
        });

        await update({
          modelName: "Producto",
          id: producto.id,
          data: { imagen: 'productos/' + imageName },
        });
      }

      res.status(201).json({ message: 'Producto actualizado exitosamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deleteproducto: async (req, res) => {
    try {
      const { id } = req.params;

      const producto = await find({
        modelName: "Producto",
        id,
        failOnEmpty: true,
      });

      const empresa_id = producto.empresa_id;

      await registroLog({
        usuario: req.user.nombre,
        detalle: `Eliminó el Producto: ${producto.codigo_producto_contribuyente}`,
        accion: "Eliminación",
        empresa_id,
      });

      const imagen = producto.imagen;

      await destroy({
        modelName: "Producto",
        id: producto.id,
      });

      if (imagen) {
        await deleteFile({ targetPath: uploadPath, fileName: path.basename(imagen) });
      }

      res.status(200).json({ message: 'Producto eliminado correctamente.' });
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

  getrubrosname: async (req, res) => {
    try {
      const { empresa_id } = req.query;

      const rubros = await list({
        modelName: "Producto",
        where: { empresa_id },
        attributes: ["nombre"],
      });

      const nombresRubros = rubros.map(rubro => rubro.nombre);

      res.status(200).json({ rubros: nombresRubros });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

module.exports = ProductoController;
