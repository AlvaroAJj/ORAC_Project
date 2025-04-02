# Fan Page de Harry Potter

Este é um projeto de fan page de Harry Potter com sistema de perguntas e respostas.

## Requisitos

- Node.js
- MongoDB
- npm ou yarn

## Instalação

1. Clone o repositório
2. Instale as dependências do backend:
```bash
npm install
```

3. Instale as dependências do frontend:
```bash
cd client
npm install
```

4. Configure as variáveis de ambiente:
- Copie o arquivo `.env.example` para `.env`
- Ajuste as variáveis conforme necessário

5. Inicie o MongoDB localmente

6. Inicie o servidor backend:
```bash
npm run dev
```

7. Em outro terminal, inicie o frontend:
```bash
cd client
npm start
```

## Uso

1. Acesse a página inicial em `http://localhost:5000`
2. Faça login com as credenciais de administrador
3. Você pode:
   - Ver todas as perguntas
   - Fazer novas perguntas
   - Responder perguntas (apenas administradores)

## Estrutura do Projeto

- `/client` - Frontend React
- `/models` - Modelos do MongoDB
- `/routes` - Rotas da API
- `server.js` - Servidor Express 
