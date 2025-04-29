const { find, list, update } = require("../services");

const ProveedorController = {
  searchproveedor: async (req, res) => {
    try {
      const { nit_proveedor, empresa_id } = req.query;

      const proveedor = await find({
        modelName: "Proveedor",
        where: {
          nit: nit_proveedor,
          empresa_id,
        },
      });

      res.status(200).json({
        success: true,
        data: {
          codigo_autorizacion: proveedor?.codigo_autorizacion || "",
          razon_social_proveedor: proveedor?.razon_social || "",
          rubro: proveedor?.rubro || "",
        },
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getproveedores: async (req, res) => {
    try {
      const { empresa_id } = req.query;

      const proveedores = await list({
        modelName: "Proveedor",
        where: { empresa_id },
      });

      res.status(200).json({
        success: true,
        data: { proveedores },
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editproveedor: async (req, res) => {
    try {
      const { id, razon_social, rubro, nit, celular } = req.body;

      await find({
        modelName: "Proveedor",
        id,
        failOnEmpty: true,
      });

      await update({
        modelName: "Proveedor",
        id,
        data: { razon_social, rubro, nit, celular },
      });

      res.status(200).json({
        success: true,
        message: "Proveedor actualizado correctamente.",
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

module.exports = ProveedorController;
