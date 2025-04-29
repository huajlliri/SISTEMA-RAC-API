const { find, list, update } = require("../services");

const ClienteController = {
  searchcliente: async (req, res) => {
    try {
      const { nit_ci_cliente, empresa_id } = req.query;

      const cliente = await find({
        modelName: "Cliente",
        where: {
          nit_ci_cex: nit_ci_cliente,
          empresa_id,
        },
      });

      const complemento = cliente?.complemento || '';
      const razon_social = cliente?.razon_social || '';

      res.status(200).json({ complemento, razon_social });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getclientes: async (req, res) => {
    try {
      const { empresa_id } = req.query;

      const clientes = await list({
        modelName: "Cliente",
        where: { empresa_id },
      });

      res.status(200).json({ clientes });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editcliente: async (req, res) => {
    try {
      const { id, razon_social, complemento, nit_ci_cex, celular } = req.body;

      const cliente = await find({
        modelName: "Cliente",
        id,
        failOnEmpty: true,
      });

      await update({
        modelName: "Cliente",
        id,
        data: { razon_social, complemento, nit_ci_cex, celular },
      });

      res.status(200).json({ message: 'Cliente actualizado correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

module.exports = ClienteController;
