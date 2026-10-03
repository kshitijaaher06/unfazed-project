require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Therapist = require('./models/Therapist');
const Tier = require('./models/SubscriptionTierConfig');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Tier.deleteMany({});
  await Tier.insertMany([
    { tier: 'free', price_monthly: 0, caps: { activeClients: 5 }, features: { soapTemplates: false, advancedAnalytics: false } },
    { tier: 'pro', price_monthly: 999, caps: { activeClients: 50 }, features: { soapTemplates: true, advancedAnalytics: true } }
  ]);
  await Therapist.deleteMany({ email: 'sharma@test.com' });
  await Therapist.create({ email: 'sharma@test.com', name: 'Dr Sharma', slug: 'dr-sharma',
    password_hash: await bcrypt.hash('123456', 10), bio: 'Clinical psychologist',
    specializations: ['Anxiety', 'CBT'], languages: ['English', 'Hindi'], tier: 'free' });
  console.log('Seeded. Login: sharma@test.com / 123456'); process.exit(0);
})();
