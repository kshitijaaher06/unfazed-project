const mongoose = require('mongoose');
const Client = require('../models/Client');
const Session = require('../models/Session');
const SessionNote = require('../models/SessionNote');
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

// Sortable / filterable list - done in MongoDB (aggregation), not in the browser
exports.listClients = async (req, res, next) => {
  try {
    const { q, status, tag, sort = 'created', order = 'desc' } = req.query;
    const match = { therapist_id: new mongoose.Types.ObjectId(req.user.id) };
    if (q) match.name = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (status) match.status = status;
    if (tag) match.tags = tag;
    const sortField = { name: 'name', last_session: 'last_session', status: 'status', created: 'createdAt' }[sort] || 'createdAt';
    const list = await Client.aggregate([
      { $match: match },
      { $lookup: {
          from: 'sessions', let: { cid: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$client_id', '$$cid'] }, { $ne: ['$status', 'cancelled'] }, { $lte: ['$start', new Date()] }] } } },
            { $sort: { start: -1 } }, { $limit: 1 }
          ], as: 'last' } },
      { $addFields: { last_session: { $arrayElemAt: ['$last.start', 0] } } },
      { $project: { last: 0 } },
      { $sort: { [sortField]: order === 'asc' ? 1 : -1 } }
    ]);
    res.json(list);
  } catch (e) { next(e); }
};

// Client profile: details + session history + notes (+ payments placeholder until Module 4)
exports.getClient = async (req, res, next) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, therapist_id: req.user.id });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    const [sessions, notes] = await Promise.all([
      Session.find({ client_id: client._id, therapist_id: req.user.id }).sort({ start: -1 }),
      SessionNote.find({ client_id: client._id, therapist_id: req.user.id }).sort({ createdAt: -1 })
    ]);
    res.json({ client, sessions, notes, payments: [] });
  } catch (e) { next(e); }
};

exports.updateClient = async (req, res, next) => {
  try {
    const { status, tags, name } = req.body;
    const client = await Client.findOne({ _id: req.params.id, therapist_id: req.user.id });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    if (status === 'active' && client.status !== 'active') {   // re-activating counts against the cap
      const active = await Client.countDocuments({ therapist_id: req.user.id, status: 'active' });
      const r = await canAccess(req.user.id, 'caps.activeClients', active);
      if (!r.allowed) return res.status(403).json({ message: `Active client limit (${r.limit}) reached. Upgrade to re-activate.`, upgrade: true });
    }
    if (status) client.status = status;
    if (Array.isArray(tags)) client.tags = tags;
    if (name) client.name = name;
    await client.save();
    res.json(client);
  } catch (e) { next(e); }
};
