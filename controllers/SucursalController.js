const {
  create,
  update,
  destroy,
  find,
  list,
  bulkCreate,
} = require("../services");
const { Op } = require("sequelize");

const SucursalController = {
  getsucursales: async (req, res) => {
    try {
      const { empresa_id } = req.query;

      const sucursales = await list({
        modelName: "Sucursal",
        where: { empresa_id },
      });

      res.status(200).json({
        success: true,
        data: { sucursales },
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addsucursal: async (req, res) => {
    try {
      const { codigo, zona_lugar, direccion, empresa_id } = req.body;

      const exist = await find({
        modelName: "Sucursal",
        where: { codigo, empresa_id },
      });

      if (exist) {
        return res
          .status(400)
          .json({
            message:
              "El código de sucursal ya está registrado en esta empresa.",
          });
      }

      const sucursal = await create({
        modelName: "Sucursal",
        data: { codigo, zona_lugar, direccion, empresa_id },
      });

      const createdAtDate = sucursal.createdAt.toISOString().split("T")[0];

      const cuentas = await bulkCreate({
        modelName: "Cuenta",
        data: [
          {
            sucursal_id: sucursal.id,
            nombre: "CAJA",
            detalle: "CAJA PRINCIPAL",
            saldo: 0.0,
          },
          {
            sucursal_id: sucursal.id,
            nombre: "BANCO",
            detalle: "0",
            saldo: 0.0,
          },
        ],
      });

      await bulkCreate({
        modelName: "Efectivo",
        data: cuentas.map((cuenta) => ({
          sucursal_id: sucursal.id,
          ref_id: null,
          ref_key: "SALDO INICIAL",
          detalle: "",
          fecha: createdAtDate,
          monto: 0.0,
          movimiento: "Ingreso",
          cuenta_id: cuenta.id,
          cuenta_ref_id: null,
          respaldo: null,
          nro_documento: null,
        })),
      });

      await create({
        modelName: "Registro",
        data: {
          usuario: req.user.nombre,
          detalle: `Creó la sucursal: ${zona_lugar}`,
          accion: "Creación",
          empresa_id,
        },
      });

      res.status(201).json({
        success: true,
        message: "Sucursal creada exitosamente.",
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editsucursal: async (req, res) => {
    try {
      const { id, codigo, zona_lugar, direccion, empresa_id } = req.body;

      await find({
        modelName: "Sucursal",
        id,
        failOnEmpty: true,
      });

      const exist = await find({
        modelName: "Sucursal",
        where: {
          codigo,
          empresa_id,
          id: { [Op.ne]: id },
        },
      });

      if (exist) {
        return res
          .status(400)
          .json({
            message:
              "El código de sucursal ya está registrado en esta empresa.",
          });
      }

      await update({
        modelName: "Sucursal",
        id,
        data: { codigo, zona_lugar, direccion },
      });

      res.status(200).json({
        success: true,
        message: "Sucursal actualizada exitosamente.",
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deletesucursal: async (req, res) => {
    try {
      const { id } = req.params;

      const sucursal = await find({
        modelName: "Sucursal",
        id,
        failOnEmpty: true,
      });

      await create({
        modelName: "Registro",
        data: {
          usuario: req.user.nombre,
          detalle: `Eliminó la sucursal: ${sucursal.zona_lugar}`,
          accion: "Eliminación",
          empresa_id: sucursal.empresa_id,
        },
      });

      await destroy({
        modelName: "Sucursal",
        id,
      });

      res.status(200).json({
        success: true,
        message: "Sucursal eliminada correctamente.",
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

module.exports = SucursalController;
