const { create, update, destroy, find, list } = require("../services");
const models = require("../models/Relaciones");
const { Op } = require("sequelize");

const InventarioController = {
  getinventario: async (req, res) => {
    try {
      const { almacen_id } = req.query;

      const inventario = await list({
        modelName: "Inventario",
        where: { almacen_id },
        include: [
          {
            model: models.Producto,
            as: "producto",
            required: true,
            include: [
              {
                model: models.SubLinea,
                as: "sublinea",
                include: [{ model: models.Linea, as: "linea" }],
              },
            ],
          },
        ],
      });

      if (!inventario.length) {
        return res.status(200).json({ inventario: [], dataCustomer: [] });
      }

      const almacen = await find({ modelName: "Almacen", id: almacen_id });
      const empresa = await find({ modelName: "Empresa", id: almacen.empresa_id });

      const dataCustomer = {
        nit: empresa.nit,
        razon_social: empresa.razon_social,
        almacen: `${almacen.codigo} - ${almacen.nombre}`,
        titular: empresa.titular,
        ci: empresa.ci,
      };

      res.status(200).json({ inventario, dataCustomer });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addproductoinventario: async (req, res) => {
    try {
      const {
        tipo, cantidad, nro_documento, observaciones,
        fecha, producto_id, almacen_id, almacen_ref_id
      } = req.body;

      let inventario = await find({
        modelName: "Inventario",
        where: { almacen_id, producto_id },
      });

      if (!inventario) {
        inventario = await create({
          modelName: "Inventario",
          data: { producto_id, almacen_id, cantidad: 0 },
        });
      }

      if (tipo === "Ingreso") {
        inventario.cantidad = (parseFloat(inventario.cantidad) + parseFloat(cantidad)).toFixed(2);
      } else if (tipo === "Transpaso a otro almacen") {
        let inventario_ref = await find({
          modelName: "Inventario",
          where: { almacen_id: almacen_ref_id, producto_id },
        });

        if (!inventario_ref) {
          inventario_ref = await create({
            modelName: "Inventario",
            data: { producto_id, almacen_id: almacen_ref_id, cantidad: 0 },
          });
        }

        inventario_ref.cantidad = (parseFloat(inventario_ref.cantidad) + parseFloat(cantidad)).toFixed(2);
        inventario.cantidad = (parseFloat(inventario.cantidad) - parseFloat(cantidad)).toFixed(2);

        await update({ modelName: "Inventario", id: inventario_ref.id, data: { cantidad: inventario_ref.cantidad } });

        await create({
          modelName: "HistorialInventario",
          data: {
            almacen_id: almacen_ref_id,
            almacen_ref_id: almacen_id,
            producto_id,
            tipo: "Ingreso por Transpaso",
            cantidad,
            nro_documento,
            observaciones,
            fecha,
          },
        });
      } else {
        inventario.cantidad = (parseFloat(inventario.cantidad) - parseFloat(cantidad)).toFixed(2);
      }

      await update({ modelName: "Inventario", id: inventario.id, data: { cantidad: inventario.cantidad } });

      await create({
        modelName: "HistorialInventario",
        data: { almacen_id, almacen_ref_id, producto_id, tipo, cantidad, nro_documento, observaciones, fecha },
      });

      res.status(201).json({ message: "Éxito" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editproductoinventario: async (req, res) => {
    try {
      const { id, tipo, cantidad, nro_documento, observaciones, fecha, producto_id, almacen_ref_id } = req.body;

      const historial = await find({ modelName: "HistorialInventario", id, failOnEmpty: true });
      const inventario = await find({
        modelName: "Inventario",
        where: { almacen_id: historial.almacen_id, producto_id: historial.producto_id },
      });

      if (tipo === "Ingreso") {
        inventario.cantidad = (parseFloat(inventario.cantidad) - parseFloat(historial.cantidad) + parseFloat(cantidad)).toFixed(2);
      } else if (tipo === "Transpaso a otro almacen") {
        const inventario_ref = await find({
          modelName: "Inventario",
          where: { almacen_id: almacen_ref_id, producto_id },
        });

        inventario_ref.cantidad = (parseFloat(inventario_ref.cantidad) - parseFloat(historial.cantidad) + parseFloat(cantidad)).toFixed(2);
        inventario.cantidad = (parseFloat(inventario.cantidad) + parseFloat(historial.cantidad) - parseFloat(cantidad)).toFixed(2);

        await update({ modelName: "Inventario", id: inventario_ref.id, data: { cantidad: inventario_ref.cantidad } });

        const historial_ref = await find({
          modelName: "HistorialInventario",
          where: {
            almacen_id: historial.almacen_ref_id,
            producto_id: historial.producto_id,
            cantidad: historial.cantidad,
            fecha: historial.fecha,
            tipo: "Ingreso por Transpaso",
          },
        });

        if (historial_ref) {
          await update({ modelName: "HistorialInventario", id: historial_ref.id, data: { cantidad, nro_documento, observaciones, fecha } });
        }
      } else {
        inventario.cantidad = (parseFloat(inventario.cantidad) + parseFloat(historial.cantidad) - parseFloat(cantidad)).toFixed(2);
      }

      await update({ modelName: "Inventario", id: inventario.id, data: { cantidad: inventario.cantidad } });
      await update({ modelName: "HistorialInventario", id: historial.id, data: { cantidad, nro_documento, observaciones, fecha } });

      res.status(201).json({ message: "Éxito" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  gethistorialInventarios: async (req, res) => {
    try {
      const { almacen_id, fecha_inicio, fecha_final } = req.query;
      const fechaInicio = new Date(fecha_inicio).toISOString().split("T")[0];
      const fechaFin = new Date(fecha_final).toISOString().split("T")[0];

      const historial = await list({
        modelName: "HistorialInventario",
        where: {
          almacen_id,
          fecha: { [Op.between]: [fechaInicio, fechaFin] },
        },
        include: [
          {
            model: models.Producto,
            as: "producto",
            required: true,
            include: [
              {
                model: models.SubLinea,
                as: "sublinea",
                include: [{ model: models.Linea, as: "linea" }],
              },
            ],
          },
        ],
        order: [["fecha", "ASC"], ["nro", "ASC"]],
      });

      for (const historialItem of historial) {
        const inventario = await find({
          modelName: "Inventario",
          where: { almacen_id: historialItem.almacen_id, producto_id: historialItem.producto_id },
        });
        historialItem.dataValues.inventario = inventario;
      }

      const almacen = await find({ modelName: "Almacen", id: almacen_id });
      const empresa = await find({ modelName: "Empresa", id: almacen.empresa_id });

      const dataCustomer = {
        nit: empresa.nit,
        razon_social: empresa.razon_social,
        almacen: `${almacen.codigo} - ${almacen.nombre}`,
        titular: empresa.titular,
        ci: empresa.ci,
      };

      res.status(200).json({ historial, dataCustomer });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deleteHistorialInventario: async (req, res) => {
    try {
      const { id } = req.params;

      const historial = await find({ modelName: "HistorialInventario", id, failOnEmpty: true });
      const inventario = await find({
        modelName: "Inventario",
        where: { almacen_id: historial.almacen_id, producto_id: historial.producto_id },
      });

      if (historial.tipo === "Ingreso") {
        inventario.cantidad = (parseFloat(inventario.cantidad) - parseFloat(historial.cantidad)).toFixed(2);
      } else if (historial.tipo === "Transpaso a otro almacen") {
        let inventario_ref = await find({
          modelName: "Inventario",
          where: { almacen_id: historial.almacen_ref_id, producto_id: historial.producto_id },
        });

        inventario_ref.cantidad = (parseFloat(inventario_ref.cantidad) - parseFloat(historial.cantidad)).toFixed(2);
        inventario.cantidad = (parseFloat(inventario.cantidad) + parseFloat(historial.cantidad)).toFixed(2);

        await update({ modelName: "Inventario", id: inventario_ref.id, data: { cantidad: inventario_ref.cantidad } });

        const historial_ref = await find({
          modelName: "HistorialInventario",
          where: {
            almacen_id: historial.almacen_ref_id,
            producto_id: historial.producto_id,
            cantidad: historial.cantidad,
            fecha: historial.fecha,
            tipo: "Ingreso por Transpaso",
          },
        });

        if (historial_ref) {
          await destroy({ modelName: "HistorialInventario", id: historial_ref.id });
        }
      } else if (historial.tipo === "Ingreso por Transpaso") {
        let inventario_ref = await find({
          modelName: "Inventario",
          where: { almacen_id: historial.almacen_ref_id, producto_id: historial.producto_id },
        });

        inventario_ref.cantidad = (parseFloat(inventario_ref.cantidad) + parseFloat(historial.cantidad)).toFixed(2);
        inventario.cantidad = (parseFloat(inventario.cantidad) - parseFloat(historial.cantidad)).toFixed(2);

        await update({ modelName: "Inventario", id: inventario_ref.id, data: { cantidad: inventario_ref.cantidad } });

        const historial_ref = await find({
          modelName: "HistorialInventario",
          where: {
            almacen_id: historial.almacen_ref_id,
            producto_id: historial.producto_id,
            cantidad: historial.cantidad,
            fecha: historial.fecha,
            tipo: "Transpaso a otro almacen",
          },
        });

        if (historial_ref) {
          await destroy({ modelName: "HistorialInventario", id: historial_ref.id });
        }
      } else {
        inventario.cantidad = (parseFloat(inventario.cantidad) + parseFloat(historial.cantidad)).toFixed(2);
      }

      await update({ modelName: "Inventario", id: inventario.id, data: { cantidad: inventario.cantidad } });
      await destroy({ modelName: "HistorialInventario", id: historial.id });

      res.status(200).json({ message: "Eliminación exitosa." });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

module.exports = InventarioController;
