const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

const Dependiente = require('../models/Dependiente');
const Empresa = require('../models/Empresa');
const Patronal = require('../models/Patronal');
const PlanillaSueldo = require('../models/PlanillaSueldo');

const PatronalController = {
  getpatronales: async (req, res) => {
    try {
      const { empresa_id, mes, gestion } = req.query;

      const dependientes = await Dependiente.findAll({
        where: {
          empresa_id,
          estado: { [Sequelize.Op.or]: ['ACTIVO', 'JUBILADO'] },
          tipo: 'DEPENDIENTE',
        },
        include: [
          {
            model: Patronal,
            as: 'patronales',
            where: { periodo: `${mes}/${gestion}` },
            required: false,
          },
          {
            model: PlanillaSueldo,
            as: 'planillas',
            where: { periodo: `${mes}/${gestion}` },
            required: false,
          },
        ],
        order: [['apellido_paterno', 'ASC']],
      });

      const ultimoPatronal = await Patronal.findOne({
        order: [['updatedAt', 'DESC']],
      });

      const empresa = await Empresa.findByPk(empresa_id);
      if (!empresa) {
        return res.status(404).json({ message: 'Empresa no encontrada.' });
      }

      const dataCustomer = {
        nit: empresa.nit,
        razon_social: empresa.razon_social,
        titular: empresa.titular,
        ci: empresa.ci,
        numero_patronal: empresa.numero_patronal,
        logo: null,
      };

      if (empresa.logo) {
        const logoPath = path.join(__dirname, '..', 'public', 'logos', empresa.logo.replace('logos/', ''));
        if (fs.existsSync(logoPath)) {
          const imageBuffer = fs.readFileSync(logoPath);
          const imageBase64 = imageBuffer.toString('base64');
          dataCustomer.logo = `data:image/webp;base64,${imageBase64}`;
        }
      }

      res.status(200).json({
        dependientes,
        dataCustomer,
        CNS: ultimoPatronal?.CNS || '0',
        PNSV: ultimoPatronal?.PNSV || '0',
        APS: ultimoPatronal?.APS || '0',
        RP: ultimoPatronal?.RP || '0',
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  setPatronales: async (req, res) => {
    try {
      const { dependientesData, mes, gestion } = req.body;

      for (const dependiente of dependientesData) {
        const patronal = await Patronal.findByPk(dependiente.patronal.id);

        const patronalData = {
          CNS: dependiente.patronal.CNS,
          PNSV: dependiente.patronal.PNSV,
          APS: dependiente.patronal.APS,
          RP: dependiente.patronal.RP,
          periodo: `${mes}/${gestion}`,
          total_ganado: dependiente.patronal.total_ganado,
          total_aportes: dependiente.patronal.total_aportes,
          prov_aguinaldo: dependiente.patronal.prov_aguinaldo,
          prov_seg_aguinaldo: dependiente.patronal.prov_seg_aguinaldo,
          prov_indem: dependiente.patronal.prov_indem,
          total_cargas: dependiente.patronal.total_cargas,
          costo_total: dependiente.patronal.costo_total,
        };

        if (patronal) {
          await patronal.update(patronalData);
        } else {
          await Patronal.create({
            ...patronalData,
            dependiente_id: dependiente.id,
          });
        }
      }

      res.status(201).json({ message: 'Valores creados o actualizados correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deletePatronal: async (req, res) => {
    try {
      const { id } = req.params;

      const patronal = await Patronal.findByPk(id);
      if (!patronal) {
        return res.status(404).json({ message: 'Valor no encontrado.' });
      }

      await patronal.destroy();

      res.status(200).json({ message: 'Valor eliminado correctamente.' });
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
};

module.exports = PatronalController;
