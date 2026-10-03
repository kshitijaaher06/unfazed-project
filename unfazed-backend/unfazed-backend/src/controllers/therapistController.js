const Therapist = require('../models/Therapist');
const PUBLIC = 'name slug bio specializations languages';

exports.getPublicProfile = async (req, res, next) => {
  try {
    const t = await Therapist.findOne({ slug: req.params.slug }).select(PUBLIC);
    if (!t) return res.status(404).json({ message: 'Profile not found' });
    res.json(t);
  } catch (e) { next(e); }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { name, bio, specializations, languages } = req.body;
    const t = await Therapist.findByIdAndUpdate(req.user.id,
      { name, bio, specializations, languages }, { new: true }).select(PUBLIC);
    res.json(t);
  } catch (e) { next(e); }
};
