const Availability = require('../models/Availability');
const Session = require('../models/Session');
const Therapist = require('../models/Therapist');
const Client = require('../models/Client');
const { canAccess } = require('../services/entitlementService');
const { zonedToUtc, localDateStr } = require('../utils/tz');

const DEFAULT_WEEKLY = [1, 2, 3, 4, 5].map((day) => ({ day, start: '10:00', end: '14:00' }));
const getAvail = async (therapistId) =>
  (await Availability.findOne({ therapist_id: therapistId }).lean()) ||
  { timezone: 'Asia/Kolkata', weekly: DEFAULT_WEEKLY, overrides: [], blocked: [], buffer_min: 15, durations: [30, 45, 60, 90] };

const windowsFor = (dateStr, a) => {
  const o = (a.overrides || []).find((x) => x.date === dateStr);
  if (o) return o.closed ? [] : [{ start: o.start, end: o.end }];
  const dow = new Date(dateStr + 'T00:00:00Z').getUTCDay();
  return (a.weekly || []).filter((w) => w.day === dow).map((w) => ({ start: w.start, end: w.end }));
};

async function generateSlots(therapistId, a, duration, days = 14) {
  const tz = a.timezone, now = Date.now(), buf = (a.buffer_min || 0) * 60000, dur = duration * 60000;
  const sessions = await Session.find({ therapist_id: therapistId, status: 'scheduled',
    start: { $lt: new Date(now + (days + 1) * 86400000) }, end: { $gt: new Date(now) } });
  const busy = [
    ...sessions.map((s) => [s.start.getTime(), s.end.getTime() + buf]),
    ...(a.blocked || []).map((b) => [new Date(b.start).getTime(), new Date(b.end).getTime()])
  ];
  const out = [];
  for (let i = 0; i <= days; i++) {
    const dateStr = localDateStr(now + i * 86400000, tz);
    for (const w of windowsFor(dateStr, a)) {
      let t = zonedToUtc(dateStr, w.start, tz).getTime();
      const end = zonedToUtc(dateStr, w.end, tz).getTime();
      while (t + dur <= end) {
        const e = t + dur;
        if (t > now && !busy.some(([bs, be]) => t < be && e > bs)) out.push(new Date(t).toISOString());
        t = e + buf;
      }
    }
  }
  return out;
}

exports.getAvailability = async (req, res, next) => {
  try { res.json(await getAvail(req.user.id)); } catch (e) { next(e); }
};

exports.saveAvailability = async (req, res, next) => {
  try {
    const { timezone, weekly, overrides, blocked, buffer_min, durations } = req.body;
    const doc = await Availability.findOneAndUpdate({ therapist_id: req.user.id },
      { timezone, weekly, overrides, blocked, buffer_min, durations }, { new: true, upsert: true });
    res.json(doc);
  } catch (e) { next(e); }
};

exports.publicSlots = async (req, res, next) => {
  try {
    const t = await Therapist.findOne({ slug: req.params.slug });
    if (!t) return res.status(404).json({ message: 'Therapist not found' });
    const a = await getAvail(t._id);
    const duration = Number(req.query.duration) || a.durations[0];
    if (!a.durations.includes(duration)) return res.status(400).json({ message: 'Invalid duration' });
    res.json({ therapist: t.name, timezone: a.timezone, durations: a.durations, duration, slots: await generateSlots(t._id, a, duration) });
  } catch (e) { next(e); }
};

exports.book = async (req, res, next) => {
  try {
    const { name, email, start, duration } = req.body;
    if (!name || !email || !start || !duration) return res.status(400).json({ message: 'name, email, start, duration required' });
    const t = await Therapist.findOne({ slug: req.params.slug });
    if (!t) return res.status(404).json({ message: 'Therapist not found' });
    const a = await getAvail(t._id);
    if (!a.durations.includes(Number(duration))) return res.status(400).json({ message: 'Invalid duration' });

    // slot must still be genuinely open (re-computed on server, never trust the client)
    const startIso = new Date(start).toISOString();
    const open = await generateSlots(t._id, a, Number(duration));
    if (!open.includes(startIso)) return res.status(409).json({ message: 'Sorry, that slot was just taken. Please pick another.' });

    let client = await Client.findOne({ therapist_id: t._id, email });
    if (!client) {
      const active = await Client.countDocuments({ therapist_id: t._id, status: 'active' });
      const r = await canAccess(t._id, 'caps.activeClients', active);
      if (!r.allowed) return res.status(403).json({ message: 'This therapist is not accepting new clients right now.' });
      client = await Client.create({ therapist_id: t._id, name, email });
    }
    const s = new Date(startIso);
    try {
      const session = await Session.create({ therapist_id: t._id, client_id: client._id, start: s,
        end: new Date(s.getTime() + Number(duration) * 60000) });
      res.status(201).json({ message: 'Booking confirmed', session });
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ message: 'Sorry, that slot was just taken. Please pick another.' });
      throw err;
    }
  } catch (e) { next(e); }
};

exports.mySessions = async (req, res, next) => {
  try {
    const list = await Session.find({ therapist_id: req.user.id, status: 'scheduled', start: { $gte: new Date() } })
      .sort({ start: 1 }).populate('client_id', 'name email');
    res.json(list);
  } catch (e) { next(e); }
};
