const { mongoose, connect } = require('./db');

const infoSchema = new mongoose.Schema(
  {
    centroAyuda: { type: String, default: '' },
    preguntasFrecuentes: { type: String, default: '' },
    terminosCondiciones: { type: String, default: '' },
    quienesSomos: { type: String, default: '' },
    beneficiosComprar: { type: String, default: '' },
    privacidadSeguridad: { type: String, default: '' },
    consejosTecnologicos: { type: String, default: '' },
    puntosVerdes: { type: String, default: '' }
  },
  { timestamps: true }
);

const SiteInfo = mongoose.models.SiteInfo || mongoose.model('SiteInfo', infoSchema);

const DEFAULT_INFO = {
  centroAyuda: '',
  preguntasFrecuentes: '',
  terminosCondiciones: '',
  quienesSomos: '',
  beneficiosComprar: '',
  privacidadSeguridad: '',
  consejosTecnologicos: '',
  puntosVerdes: ''
};

async function ensureConnection() {
  await connect();
}

function mergeWithDefaults(doc) {
  if (!doc) return { ...DEFAULT_INFO };
  const payload = doc.toObject ? doc.toObject() : doc;
  return { ...DEFAULT_INFO, ...payload };
}

function normalizePayload(payload = {}) {
  const aliases = {
    centroAyuda: ['centro_ayuda', 'centroDeAyuda'],
    preguntasFrecuentes: ['faq', 'preguntas_frecuentes'],
    terminosCondiciones: ['terminos', 'terminos_condiciones', 'terminosYCondiciones'],
    quienesSomos: ['quienes_somos', 'aboutUs'],
    beneficiosComprar: ['beneficios', 'beneficios_comprar'],
    privacidadSeguridad: ['privacidad', 'seguridad', 'privacidad_seguridad'],
    consejosTecnologicos: ['consejos', 'consejos_tecnologicos'],
    puntosVerdes: ['puntos', 'puntos_verdes']
  };

  const normalized = {};
  for (const key of Object.keys(DEFAULT_INFO)) {
    const options = [key, ...(aliases[key] || [])];
    const found = options.find((opt) => payload[opt] !== undefined && payload[opt] !== null);
    normalized[key] = found !== undefined ? String(payload[found]) : DEFAULT_INFO[key];
  }
  return normalized;
}

async function getSiteInfo() {
  await ensureConnection();
  const existing = await SiteInfo.findOne().lean();
  if (existing) {
    return mergeWithDefaults(existing);
  }
  const created = await SiteInfo.create(DEFAULT_INFO);
  return mergeWithDefaults(created);
}

async function upsertSiteInfo(payload = {}) {
  await ensureConnection();
  const normalized = normalizePayload(payload);
  const updated = await SiteInfo.findOneAndUpdate(
    {},
    { $set: normalized },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();
  return mergeWithDefaults(updated);
}

module.exports = {
  SiteInfo,
  DEFAULT_INFO,
  getSiteInfo,
  upsertSiteInfo
};
