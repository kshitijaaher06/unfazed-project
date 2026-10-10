const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  therapist_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true, index: true },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  type: { type: String, enum: ['private', 'shared'], required: true },   // private vs shared split
  format: { type: String, enum: ['freeform', 'soap'], default: 'freeform' },
  content: { type: String, default: '' },                                  // rich-text HTML (TipTap)
  soap: { S: String, O: String, A: String, P: String }
}, { timestamps: true });
module.exports = mongoose.model('SessionNote', schema);
