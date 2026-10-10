const Client = require('../models/Client');
const { canAccess } = require('../services/entitlementService');

exports.createClient = async (req, res, next) => {
  try {
    const active = await Client.countDocuments({ therapist_id: req.user.id, status: 'active' });
    const r = await canAccess(req.user.id, 'caps.activeClients', active); // central gate
    if (!r.allowed) return res.status(403).json({
      message: `Active client limit (${r.limit}) reached on the ${r.tier} plan. Upgrade to add more.`,
      upgrade: true, feature: 'caps.activeClients' });
    const { name, email, phone, tags } = req.body;
    res.status(201).json(await Client.create({ therapist_id: req.user.id, name, email, phone, tags: tags || [] }));
  } catch (e) { next(e); }
};

exports.listClients = async (req, res, next) => {
  try { res.json(await Client.find({ therapist_id: req.user.id }).sort({ createdAt: -1 })); }
  catch (e) { next(e); }
};
