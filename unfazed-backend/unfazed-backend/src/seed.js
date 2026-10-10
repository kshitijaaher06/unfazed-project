require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Therapist = require('./models/Therapist');
const Tier = require('./models/SubscriptionTierConfig');
const Client = require('./models/Client');
const SessionNote = require('./models/SessionNote');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Tier.deleteMany({});
  await Tier.insertMany([
    { tier: 'free', price_monthly: 0, caps: { activeClients: 3 }, features: { soapTemplates: false, advancedAnalytics: false } },
    { tier: 'pro', price_monthly: 999, caps: { activeClients: 50 }, features: { soapTemplates: true, advancedAnalytics: true } }
  ]);
  await Therapist.deleteMany({ email: 'sharma@test.com' });
  const t = await Therapist.create({ email: 'sharma@test.com', name: 'Dr Sharma', slug: 'dr-sharma',
    password_hash: await bcrypt.hash('123456', 10), bio: 'Clinical psychologist',
    specializations: ['Anxiety', 'CBT'], languages: ['English', 'Hindi'], tier: 'free' });
  await Client.deleteMany({}); await SessionNote.deleteMany({});
  const [a] = await Client.insertMany([
    { therapist_id: t._id, name: 'Riya Patil', email: 'riya@test.com', tags: ['anxiety'] },
    { therapist_id: t._id, name: 'Amit Joshi', email: 'amit@test.com', tags: ['stress'] }
  ]);
  await SessionNote.insertMany([
    { therapist_id: t._id, client_id: a._id, type: 'private', content: '<p>PRIVATE: clinical impressions</p>' },
    { therapist_id: t._id, client_id: a._id, type: 'shared', content: '<p>Homework: breathing exercise daily</p>' }
  ]);
  console.log('Seeded. Login: sharma@test.com / 123456');
  console.log('Riya portal link: http://localhost:5173/portal/' + a.access_token);
  process.exit(0);
})();
