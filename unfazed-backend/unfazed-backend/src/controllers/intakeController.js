const Client = require('../models/Client');
const CONSENT_VERSION = 'v1';

exports.getIntake = async (req, res, next) => {
  try {
    const c = await Client.findOne({ access_token: req.params.token });
    if (!c) return res.status(404).json({ message: 'Invalid link' });
    res.json({ name: c.name, intake_completed: c.intake_completed, consent_given: c.consents.length > 0 });
  } catch (e) { next(e); }
};

exports.submitIntake = async (req, res, next) => {
  try {
    const c = await Client.findOne({ access_token: req.params.token });
    if (!c) return res.status(404).json({ message: 'Invalid link' });
    const b = req.body;
    if (b.consent !== true) return res.status(400).json({ message: 'You must give consent to continue' });
    if (!b.presenting_concern || !b.presenting_concern.trim()) return res.status(400).json({ message: 'Presenting concern is required' });
    // whitelist fields; timestamp is set by the SERVER, never trusted from the browser
    c.intake = {
      age: b.age, gender: b.gender, occupation: b.occupation, emergency_contact: b.emergency_contact,
      presenting_concern: b.presenting_concern, history: b.history, submitted_at: new Date()
    };
    c.intake_completed = true;
    c.consents.push({ version: CONSENT_VERSION, accepted_at: new Date(), ip: req.ip, user_agent: req.headers['user-agent'] });
    await c.save();
    res.json({ message: 'Intake and consent recorded' });
  } catch (e) { next(e); }
};
