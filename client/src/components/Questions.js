import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/questions.css';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [answer, setAnswer] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/questions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(response.data);
    } catch (error) {
      console.error('Erro ao buscar perguntas:', error);
    }
  };

  const handleAnswerQuestion = async (questionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/questions/${questionId}/answer`,
        { answer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnswer('');
      fetchQuestions();
    } catch (error) {
      console.error('Erro ao responder pergunta:', error);
    }
  };

  return (
    <div className="questions-list">
      <h2>Perguntas e Respostas</h2>
      {questions.map((question) => (
        <div key={question._id} className="question-card">
          <h3>{question.title}</h3>
          <p>{question.content}</p>
          
          {question.answer ? (
            <div className="answer">
              <h4>Resposta</h4>
              <p>{question.answer}</p>
              <div className="question-meta">
                <span className="date">
                  Respondido em: {new Date(question.answeredAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ) : user.isAdmin && (
            <div className="question-form">
              <textarea
                placeholder="Digite sua resposta..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
              <button onClick={() => handleAnswerQuestion(question._id)}>
                Enviar Resposta
              </button>
            </div>
          )}
          
          <div className="question-meta">
            <span className="date">
              Perguntado em: {new Date(question.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Questions; 