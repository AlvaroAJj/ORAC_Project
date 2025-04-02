const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const jwt = require('jsonwebtoken');

// Middleware para verificar token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Não autorizado' });
  }
};

// Middleware para verificar se é admin
const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  next();
};

// Criar pergunta (público)
router.post('/', async (req, res) => {
  try {
    const question = new Question({
      title: req.body.title || 'Pergunta sobre Harry Potter',
      content: req.body.content
    });
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar pergunta' });
  }
});

// Buscar todas as perguntas (público)
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perguntas' });
  }
});

// Responder pergunta (requer autenticação e ser admin)
router.patch('/:id/answer', auth, isAdmin, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Pergunta não encontrada' });
    }

    question.answer = req.body.answer;
    question.answeredBy = req.user.userId;
    question.answeredAt = new Date();
    await question.save();

    res.json(question);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao responder pergunta' });
  }
});

module.exports = router; 