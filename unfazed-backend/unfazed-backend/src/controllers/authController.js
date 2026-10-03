const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Therapist = require('../models/Therapist');
const generateSlug = require('../utils/generateSlug');
const sign = (t) => jwt.sign({ id: t._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res, next) => {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    const { email, password, name } = req.body;
    if (await Therapist.exists({ email })) return res.status(409).json({ message: 'Email already registered' });
    const t = await Therapist.create({
      email, name, password_hash: await bcrypt.hash(password, 10), slug: await generateSlug(name)
    });
    res.status(201).json({ token: sign(t), therapist: { id: t._id, name: t.name, slug: t.slug } });
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const t = await Therapist.findOne({ email: req.body.email });
    if (!t || !(await bcrypt.compare(req.body.password, t.password_hash)))
      return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: sign(t), therapist: { id: t._id, name: t.name, slug: t.slug } });
  } catch (e) { next(e); }
};
