const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/harry-potter-fan', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createAdmin() {
  try {
    // Verifica se já existe um admin
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      console.log('Admin já existe!');
      process.exit(0);
    }

    // Cria o admin
    const password = await bcrypt.hash('admin123', 10);
    const admin = new User({
      username: 'admin',
      password,
      isAdmin: true
    });

    await admin.save();
    console.log('Admin criado com sucesso!');
    console.log('Username: admin');
    console.log('Senha: admin123');
  } catch (error) {
    console.error('Erro ao criar admin:', error);
  } finally {
    process.exit(0);
  }
}

createAdmin(); 