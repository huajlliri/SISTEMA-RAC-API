const { Op } = require('sequelize');
const { create, update, destroy, find, list } = require('../services');

const CuentaContableController = {

  getcuentascontables: async (req, res) => {
    try {
      const { empresa_id } = req.query;
      const cuentas = await list({
        modelName: 'CuentaContable',
        where: { empresa_id },
        order: [['nro', 'ASC']]
      });
      res.json({ cuentas });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addcuentacontable: async (req, res) => {
    try {
      const { nueva_cuenta, empresa_id } = req.body;
      await create({
        modelName: 'CuentaContable',
        data: {
          nro: nueva_cuenta.nro,
          nombre: nueva_cuenta.nombre,
          flujo: nueva_cuenta.flujo,
          moneda: nueva_cuenta.moneda,
          rubro: nueva_cuenta.rubro,
          empresa_id
        }
      });
      res.status(201).json({ message: 'Cuenta Contable creada' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  AddCuentasContablesLote: async (req, res) => {
    try {
      const { cuentas, empresa_id } = req.body;

      if (!Array.isArray(cuentas) || cuentas.length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron cuentas válidas.' });
      }

      for (const cuenta of cuentas) {
        const existente = await find({
          modelName: 'CuentaContable',
          where: { nro: cuenta.nro },
          failIfNotFound: false
        });

        if (existente) {
          await update({
            modelName: 'CuentaContable',
            id: existente.id,
            data: {
              nombre: cuenta.nombre,
              flujo: cuenta.flujo,
              moneda: cuenta.moneda,
              rubro: cuenta.rubro
            }
          });
        } else {
          await create({
            modelName: 'CuentaContable',
            data: {
              nro: cuenta.nro,
              nombre: cuenta.nombre,
              flujo: cuenta.flujo,
              moneda: cuenta.moneda,
              rubro: cuenta.rubro,
              empresa_id
            }
          });
        }
      }

      res.status(201).json({ message: 'Cuentas procesadas correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editcuentacontable: async (req, res) => {
    try {
      const { id, nombre, moneda, rubro, flujo } = req.body;

      await find({
        modelName: 'CuentaContable',
        id,
        failIfNotFound: true,
        failMessage: 'La cuenta no existe.'
      });

      await update({
        modelName: 'CuentaContable',
        id,
        data: { nombre, moneda, rubro, flujo }
      });

      res.status(201).json({ message: 'Cuenta actualizada' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deletecuentacontable: async (req, res) => {
    try {
      const { id } = req.params;

      const cuenta = await find({
        modelName: 'CuentaContable',
        id,
        failIfNotFound: true,
        failMessage: 'Cuenta no encontrada'
      });

      const prefix = cuenta.nro;
      const cuentasHijas = await list({
        modelName: 'CuentaContable',
        where: {
          nro: { [Op.like]: `${prefix}%` }
        }
      });

      for (const hija of cuentasHijas) {
        await destroy({ modelName: 'CuentaContable', id: hija.id });
      }

      await destroy({ modelName: 'CuentaContable', id: cuenta.id });

      res.status(200).json({ message: 'Eliminación exitosa' });
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError' || error.message.includes('a foreign key constraint fails')) {
        res.status(400).json({ message: 'Este registro tiene dependencias y no puede ser eliminado.' });
      } else {
        console.error(error);
        res.status(error.statusCode || 500).json({ message: error.message });
      }
    }
  }

};

module.exports = CuentaContableController;
