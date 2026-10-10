const SessionNote = require('../models/SessionNote');
const Client = require('../models/Client');
const { canAccess } = require('../services/entitlementService');
const { sharedNoteView } = require('../utils/serializers');

// Therapist-only: create private or shared note
exports.createNote = async (req, res, next) => {
  try {
    const { client_id, type, format = 'freeform', content, soap } = req.body;
    if (!['private', 'shared'].includes(type)) return res.status(400).json({ message: 'type must be private or shared' });
    const client = await Client.findOne({ _id: client_id, therapist_id: req.user.id });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    if (format === 'soap') {
      const r = await canAccess(req.user.id, 'features.soapTemplates'); // tier-gated feature
      if (!r.allowed) return res.status(403).json({ message: 'SOAP templates need an upgrade', upgrade: true, feature: 'features.soapTemplates' });
    }
    const note = await SessionNote.create({ therapist_id: req.user.id, client_id, type, format, content, soap });
    res.status(201).json(note);
  } catch (e) { next(e); }
};

// Therapist-only: sees private + shared
exports.listNotes = async (req, res, next) => {
  try {
    const q = { therapist_id: req.user.id };
    if (req.query.client_id) q.client_id = req.query.client_id;
    res.json(await SessionNote.find(q).sort({ createdAt: -1 }));
  } catch (e) { next(e); }
};

// Client-facing (no therapist auth): type is FORCED to 'shared' + serializer whitelist
exports.portalNotes = async (req, res, next) => {
  try {
    const client = await Client.findOne({ access_token: req.params.token });
    if (!client) return res.status(404).json({ message: 'Invalid link' });
    const notes = await SessionNote.find({ client_id: client._id, type: 'shared' }).sort({ createdAt: -1 });
    res.json({ client: { name: client.name }, notes: notes.map(sharedNoteView) });
  } catch (e) { next(e); }
};
