// Rola para a seção do filme selecionado
function scrollToMovie(movieId) {
    document.getElementById(movieId).scrollIntoView({ behavior: 'smooth' });
}

// Mostrar botão "Voltar ao Topo" ao rolar
window.onscroll = function() {
    let backToTopBtn = document.getElementById("backToTop");
    if (document.documentElement.scrollTop > 200) {
        backToTopBtn.style.display = "block";
    } else {
        backToTopBtn.style.display = "none";
    }
};

// Voltar ao topo
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Funções do Modal do Fórum
function openForum() {
    document.getElementById('forumModal').style.display = 'block';
    loadQuestions();
    checkAdminStatus();
}

function closeForum() {
    document.getElementById('forumModal').style.display = 'none';
}

// Funções do Modal de Login
function openLogin() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLogin() {
    document.getElementById('loginModal').style.display = 'none';
}

// Funções de API
async function loadQuestions() {
    try {
        const response = await fetch('http://localhost:5000/api/questions');
        const questions = await response.json();
        
        const token = localStorage.getItem('token');
        const isAdmin = token !== null;
        
        if (isAdmin) {
            displayAdminQuestions(questions);
        } else {
            displayUserQuestions(questions);
        }
    } catch (error) {
        console.error('Erro ao carregar perguntas:', error);
    }
}

// Função para mostrar/esconder o formulário de perguntas dos filmes
function toggleQuestionForm(movieId) {
    const form = document.getElementById(`questionForm${movieId.slice(-1)}`);
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

// Função para enviar pergunta
async function submitQuestion(movieTitle, contentId) {
    let content, title;
    
    // Se os parâmetros forem passados, é uma pergunta específica de filme
    if (movieTitle && contentId) {
        const textarea = document.getElementById(contentId);
        content = textarea.value;
        title = movieTitle;
        
        if (!content || content.trim() === '') {
            alert('Por favor, escreva sua pergunta antes de enviar.');
            return;
        }
    } else {
        // É uma pergunta do fórum geral
        const questionTextarea = document.getElementById('newQuestion');
        content = questionTextarea.value;
        title = 'Pergunta sobre Harry Potter';
        
        if (!content || content.trim() === '') {
            alert('Por favor, escreva sua pergunta antes de enviar.');
            return;
        }
    }

    try {
        console.log('Tentando enviar pergunta:', content);
        
        const response = await fetch('http://localhost:5000/api/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: content,
                title: title
            })
        });

        const responseData = await response.json();
        console.log('Resposta do servidor:', responseData);

        if (response.ok) {
            // Limpa o textarea e recarrega as perguntas
            if (movieTitle && contentId) {
                document.getElementById(contentId).value = '';
                toggleQuestionForm(`movie${contentId.slice(-1)}`);
            } else {
                document.getElementById('newQuestion').value = '';
                await loadQuestions();
            }
            alert('Pergunta enviada com sucesso!');
        } else {
            throw new Error(responseData.message || 'Erro ao enviar pergunta');
        }
    } catch (error) {
        console.error('Erro ao enviar pergunta:', error);
        alert('Erro ao enviar pergunta: ' + error.message);
    }
}

// Verificar se o usuário é administrador
function checkAdminStatus() {
    const token = localStorage.getItem('token');
    const isAdmin = token !== null;
    
    const questionsContainer = document.getElementById('questions-container');
    
    if (isAdmin) {
        // Layout para administrador (duas colunas)
        questionsContainer.innerHTML = `
            <div class="admin-forum-layout">
                <div class="admin-column">
                    <h3>Perguntas Pendentes</h3>
                    <div id="unanswered-questions" class="question-list-admin"></div>
                </div>
                <div class="admin-column">
                    <h3>Perguntas Respondidas</h3>
                    <div id="answered-questions" class="question-list-admin"></div>
                </div>
            </div>
        `;
    }
}

// Função para exibir perguntas no modo administrador
function displayAdminQuestions(questions) {
    const unansweredContainer = document.getElementById('unanswered-questions');
    const answeredContainer = document.getElementById('answered-questions');
    
    if (!unansweredContainer || !answeredContainer) return;
    
    unansweredContainer.innerHTML = '';
    answeredContainer.innerHTML = '';
    
    let unansweredCount = 0;
    let answeredCount = 0;
    
    // Ordenar perguntas
    const sortedQuestions = [...questions].sort((a, b) => {
        // Perguntas sem resposta primeiro
        if (!a.answer && b.answer) return -1;
        if (a.answer && !b.answer) return 1;
        // Ordenar por data, mais recentes primeiro
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    sortedQuestions.forEach(question => {
        const date = new Date(question.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const questionElement = document.createElement('div');
        questionElement.className = 'question-item';
        
        // Limita o título a um comprimento razoável
        const title = question.title || 'Pergunta sobre Harry Potter';
        const displayTitle = title.length > 35 ? title.substring(0, 35) + '...' : title;
        
        let html = `
            <div class="question-header">
                <h3 class="question-title">${displayTitle}</h3>
                <span class="question-date">${date}</span>
            </div>
            <div class="question-content">
                <p>${question.content}</p>
            </div>
        `;
        
        if (question.answer) {
            html += `
                <div class="question-answer">
                    <h4>Resposta:</h4>
                    <p>${question.answer}</p>
                </div>
            `;
            questionElement.innerHTML = html;
            answeredContainer.appendChild(questionElement);
            answeredCount++;
        } else {
            html += `
                <div class="admin-answer-form">
                    <textarea id="answer-${question._id}" placeholder="Digite sua resposta para esta pergunta..."></textarea>
                    <button onclick="submitAnswer('${question._id}')">Enviar Resposta</button>
                </div>
            `;
            questionElement.innerHTML = html;
            unansweredContainer.appendChild(questionElement);
            unansweredCount++;
        }
    });
    
    if (unansweredCount === 0) {
        unansweredContainer.innerHTML = '<p class="no-questions-message">Não há perguntas pendentes!</p>';
    }
    
    if (answeredCount === 0) {
        answeredContainer.innerHTML = '<p class="no-questions-message">Nenhuma pergunta foi respondida ainda.</p>';
    }
}

// Função para exibir perguntas no modo usuário
function displayUserQuestions(questions) {
    const container = document.getElementById('questions-container');
    container.innerHTML = '';
    
    if (questions.length === 0) {
        container.innerHTML = '<p class="no-questions-message">Ainda não há perguntas. Seja o primeiro a perguntar!</p>';
        return;
    }
    
    // Crie um div para o formulário de pergunta
    const formHtml = `
        <div class="question-form">
            <textarea id="newQuestion" placeholder="Faça sua pergunta sobre Harry Potter..."></textarea>
            <button onclick="submitQuestion()" class="nav-button">Enviar Pergunta</button>
        </div>
    `;
    
    // Adicione o formulário primeiro
    container.innerHTML = formHtml;
    
    // Título da seção de perguntas
    const questionsTitle = document.createElement('h3');
    questionsTitle.textContent = 'Perguntas Anteriores';
    questionsTitle.className = 'section-subtitle';
    questionsTitle.style.margin = '30px 0 20px';
    questionsTitle.style.color = '#d3a625';
    questionsTitle.style.textAlign = 'center';
    container.appendChild(questionsTitle);
    
    // Contêiner para as perguntas
    const questionsListContainer = document.createElement('div');
    questionsListContainer.className = 'questions-list';
    container.appendChild(questionsListContainer);
    
    questions.forEach(question => {
        const date = new Date(question.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const questionElement = document.createElement('div');
        questionElement.className = 'question-item';
        
        // Limita o título a um comprimento razoável
        const title = question.title || 'Pergunta sobre Harry Potter';
        const displayTitle = title.length > 40 ? title.substring(0, 40) + '...' : title;
        
        let html = `
            <div class="question-header">
                <h3 class="question-title">${displayTitle}</h3>
                <span class="question-date">${date}</span>
            </div>
            <div class="question-content">
                <p>${question.content}</p>
            </div>
        `;

        if (question.answer) {
            html += `
                <div class="question-answer">
                    <h4>Resposta:</h4>
                    <p>${question.answer}</p>
                </div>
            `;
        }

        questionElement.innerHTML = html;
        questionsListContainer.appendChild(questionElement);
    });
}

// Função para enviar resposta (admin)
async function submitAnswer(questionId) {
    const answerText = document.getElementById(`answer-${questionId}`).value;
    
    if (!answerText || answerText.trim() === '') {
        alert('Por favor, escreva uma resposta antes de enviar.');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`http://localhost:5000/api/questions/${questionId}/answer`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ answer: answerText })
        });
        
        if (response.ok) {
            alert('Resposta enviada com sucesso!');
            loadQuestions();
        } else {
            const data = await response.json();
            throw new Error(data.message || 'Erro ao enviar resposta');
        }
    } catch (error) {
        console.error('Erro ao responder pergunta:', error);
        alert('Erro ao enviar resposta: ' + error.message);
    }
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            closeLogin();
            loadQuestions(); // Recarrega as perguntas para mostrar opções de admin
            updateLoginButton();
        } else {
            alert('Usuário ou senha inválidos');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
    }
}

function logout() {
    localStorage.removeItem('token');
    updateLoginButton();
    loadQuestions();
}

function updateLoginButton() {
    const loginButton = document.querySelector('.nav-button:last-child'); // Pega o segundo botão (Login)
    if (localStorage.getItem('token')) {
        loginButton.textContent = 'Logout';
        loginButton.onclick = logout;
    } else {
        loginButton.textContent = 'Login';
        loginButton.onclick = openLogin;
    }
}

// Fecha os modais quando clica fora deles
window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = 'none';
    }
}

// Configura eventos para enviar formulário ao pressionar Enter
function setupEnterKeyEvents() {
    // Para o formulário principal do fórum
    const mainTextarea = document.getElementById('newQuestion');
    if (mainTextarea) {
        mainTextarea.addEventListener('keydown', handleEnterKey);
    }
    
    // Para os formulários específicos dos filmes
    for (let i = 1; i <= 8; i++) {
        const textarea = document.getElementById(`questionContent${i}`);
        if (textarea) {
            textarea.dataset.movieId = i;
            textarea.addEventListener('keydown', handleMovieQuestionEnterKey);
        }
    }
    
    // Para caixas de resposta do admin (estas são criadas dinamicamente)
    document.addEventListener('focusin', function(event) {
        if (event.target && event.target.id && event.target.id.startsWith('answer-')) {
            if (!event.target.hasEnterKeyListener) {
                const questionId = event.target.id.replace('answer-', '');
                event.target.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submitAnswer(questionId);
                    }
                });
                event.target.hasEnterKeyListener = true;
            }
        }
    });
}

// Manipula evento de tecla Enter no formulário principal
function handleEnterKey(e) {
    if (e.key === 'Enter') {
        if (!e.shiftKey) {
            e.preventDefault();
            submitQuestion();
        }
    }
}

// Manipula evento de tecla Enter nos formulários específicos dos filmes
function handleMovieQuestionEnterKey(e) {
    if (e.key === 'Enter') {
        if (!e.shiftKey) {
            e.preventDefault();
            const movieId = e.target.dataset.movieId;
            let movieTitle;
            
            switch(movieId) {
                case '1': movieTitle = 'Harry Potter e a Pedra Filosofal'; break;
                case '2': movieTitle = 'Harry Potter e a Câmara Secreta'; break;
                case '3': movieTitle = 'Harry Potter e o Prisioneiro de Azkaban'; break;
                case '4': movieTitle = 'Harry Potter e o Cálice de Fogo'; break;
                case '5': movieTitle = 'Harry Potter e a Ordem da Fênix'; break;
                case '6': movieTitle = 'Harry Potter e o Enigma do Príncipe'; break;
                case '7': movieTitle = 'Harry Potter e as Relíquias da Morte - Parte 1'; break;
                case '8': movieTitle = 'Harry Potter e as Relíquias da Morte - Parte 2'; break;
            }
            
            submitQuestion(movieTitle, `questionContent${movieId}`);
        }
    }
}

// Carrega as perguntas e atualiza o botão de login quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
    updateLoginButton();
    setupEnterKeyEvents();
    
    // Adicionar evento para o modal do fórum, pois o textarea principal é criado dinamicamente
    document.getElementById('forumModal').addEventListener('click', function(event) {
        // Verifica se o newQuestion foi clicado e ainda não tem o listener
        if (event.target && event.target.id === 'newQuestion' && !event.target.hasEnterKeyListener) {
            event.target.addEventListener('keydown', handleEnterKey);
            event.target.hasEnterKeyListener = true;
        }
    });
});

// Controle de visibilidade do botão Home
window.addEventListener('scroll', () => {
    const homeButton = document.getElementById('homeButton');
    if (window.scrollY > 300) {
        homeButton.classList.add('visible');
    } else {
        homeButton.classList.remove('visible');
    }
});
