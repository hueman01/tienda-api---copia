const siteInfoModel = require('../models/siteInfo.model');

exports.getInfo = async (req, res) => {
  try {
    const info = await siteInfoModel.getSiteInfo();
    res.status(200).json(info);
  } catch (error) {
    console.error('Error al obtener la informacion del sitio:', error);
    res.status(500).json({ message: 'Error al obtener la informacion del sitio' });
  }
};

exports.saveInfo = async (req, res) => {
  try {
    const payload = req.body || {};
    const saved = await siteInfoModel.upsertSiteInfo(payload);
    res.status(200).json(saved);
  } catch (error) {
    console.error('Error al guardar la informacion del sitio:', error);
    res.status(500).json({ message: 'Error al guardar la informacion del sitio' });
  }
};
