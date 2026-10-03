const Therapist = require('../models/Therapist');
const base = (n) => n.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// Unique slug: dr-sharma, dr-sharma-2, dr-sharma-3 ...
module.exports = async (name) => {
  const root = base(name) || 'therapist';
  let slug = root, i = 1;
  while (await Therapist.exists({ slug })) slug = `${root}-${++i}`;
  return slug;
};
