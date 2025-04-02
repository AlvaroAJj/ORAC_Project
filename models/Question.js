const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Pergunta sobre Harry Potter'
  },
  content: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    default: null
  },
  answeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  answeredAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema); 