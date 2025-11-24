# ⚙️ Configuração de Ambiente - TCC Fitness App

## 🔧 Variáveis de Ambiente Necessárias

### **Backend (.env)**
```bash
# Servidor
PORT=3000
NODE_ENV=development

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fitness_app
DB_USER=postgres
DB_PASSWORD=senha123

# JWT
JWT_SECRET=sua_chave_secreta_jwt_aqui
JWT_EXPIRES_IN=7d

# IA (OpenAI)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4000

# IA (Claude - Alternativa)
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-sonnet-20240229

# CORS
CORS_ORIGIN=http://localhost:19006

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **Frontend (.env)**
```bash
# API Backend
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_API_TIMEOUT=30000

# Desenvolvimento
EXPO_PUBLIC_DEBUG=true
EXPO_PUBLIC_LOG_LEVEL=debug
```

---

## 🗄️ Configuração do Banco de Dados

### **PostgreSQL (Recomendado)**

#### **1. Instalação**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# Baixar do site oficial: https://www.postgresql.org/download/windows/
```

#### **2. Configuração Inicial**
```bash
# Criar usuário e banco
sudo -u postgres psql
CREATE USER fitness_user WITH PASSWORD 'senha123';
CREATE DATABASE fitness_app OWNER fitness_user;
GRANT ALL PRIVILEGES ON DATABASE fitness_app TO fitness_user;
\q
```

#### **3. Scripts SQL**

**schema.sql**
```sql
-- Tabela de usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de planos de treino
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de dias do plano
CREATE TABLE workout_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  routine_type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE
);

-- Tabela de exercícios
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_day_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  body_part VARCHAR(100) NOT NULL,
  target VARCHAR(100) NOT NULL,
  equipment VARCHAR(100) NOT NULL,
  sets INTEGER,
  reps VARCHAR(50),
  rest VARCHAR(50),
  gif_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workout_plan_day_id) REFERENCES workout_plan_days(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_workout_plans_user_id ON workout_plans(user_id);
CREATE INDEX idx_workout_plan_days_plan_id ON workout_plan_days(workout_plan_id);
CREATE INDEX idx_exercises_day_id ON exercises(workout_plan_day_id);
CREATE INDEX idx_users_email ON users(email);
```

**seed.sql**
```sql
-- Inserir usuário de teste
INSERT INTO users (email, password_hash, name) VALUES 
('teste@email.com', '$2b$10$rQZ8K9vX7mN2pL3qR5sT6uI8wE1yU4oP7aS0dF3gH6jK9mN2pL5qR8sT', 'Usuário Teste');

-- Inserir plano de teste
INSERT INTO workout_plans (user_id, name, description) VALUES 
((SELECT id FROM users WHERE email = 'teste@email.com'), 'UPPER LOWER', 'Treino dividido em membros superiores e inferiores');

-- Inserir dias do plano
INSERT INTO workout_plan_days (workout_plan_id, day_number, routine_type, name) VALUES 
((SELECT id FROM workout_plans WHERE name = 'UPPER LOWER'), 1, 'upper', 'Upper 1'),
((SELECT id FROM workout_plans WHERE name = 'UPPER LOWER'), 2, 'lower', 'Lower 1');

-- Inserir exercícios do Upper 1
INSERT INTO exercises (workout_plan_day_id, name, body_part, target, equipment, sets, reps, rest) VALUES 
((SELECT id FROM workout_plan_days WHERE name = 'Upper 1'), 'Supino Reto com Barra', 'Peito', 'Peitoral Maior', 'Barra', 4, '8-12', '90s'),
((SELECT id FROM workout_plan_days WHERE name = 'Upper 1'), 'Puxada Frontal', 'Costas', 'Latíssimo do Dorso', 'Máquina', 4, '10-12', '60s'),
((SELECT id FROM workout_plan_days WHERE name = 'Upper 1'), 'Desenvolvimento com Halteres', 'Ombros', 'Deltoide', 'Halteres', 3, '10-12', '60s');
```

---

## 🤖 Configuração da IA

### **OpenAI (Recomendado)**

#### **1. Configuração da API**
```bash
# Obter API Key
# Acesse: https://platform.openai.com/api-keys
# Crie uma nova chave e adicione ao .env

OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7
```

#### **2. Prompt Template**
```javascript
const generateWorkoutPrompt = (userInput, preferences) => {
  return `
Você é um personal trainer especializado em musculação. Crie um plano de treino baseado nas seguintes informações:

OBJETIVO: ${preferences.goal}
EXPERIÊNCIA: ${preferences.experience}
DIAS POR SEMANA: ${preferences.daysPerWeek}
EQUIPAMENTOS DISPONÍVEIS: ${preferences.equipment.join(', ')}
DURAÇÃO: ${preferences.duration}

INSTRUÇÕES DO USUÁRIO: ${userInput}

Crie um plano estruturado seguindo estas diretrizes:
1. Escolha a melhor divisão de treinos (Upper/Lower, Push/Pull/Legs, Full Body, etc.)
2. Inclua exercícios específicos para cada dia
3. Defina número de séries e repetições apropriadas
4. Especifique tempo de descanso entre séries
5. Considere progressão semanal

Retorne APENAS um JSON válido seguindo esta estrutura:
{
  "name": "NOME DO PLANO",
  "description": "Descrição do plano",
  "days": [
    {
      "id": "day_1",
      "dayNumber": 1,
      "routineType": "upper",
      "name": "Upper 1",
      "exercises": [
        {
          "id": "ex_1",
          "name": "Nome do Exercício",
          "bodyPart": "Parte do Corpo",
          "target": "Músculo Alvo",
          "equipment": "Equipamento",
          "sets": 4,
          "reps": "8-12",
          "rest": "90s"
        }
      ]
    }
  ]
}
`;
};
```

### **Claude (Alternativa)**

#### **1. Configuração**
```bash
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-sonnet-20240229
ANTHROPIC_MAX_TOKENS=4000
```

---

## 🚀 Configuração do Servidor

### **Node.js + Express**

#### **1. Estrutura do Projeto**
```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── workoutController.js
│   │   └── aiController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── WorkoutPlan.js
│   │   └── Exercise.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── workouts.js
│   │   └── ai.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── rateLimiter.js
│   ├── services/
│   │   ├── aiService.js
│   │   └── databaseService.js
│   └── utils/
│       ├── logger.js
│       └── helpers.js
├── package.json
├── .env
└── server.js
```

#### **2. package.json**
```json
{
  "name": "fitness-app-backend",
  "version": "1.0.0",
  "description": "Backend para TCC Fitness App",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "migrate": "node scripts/migrate.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1",
    "express-rate-limit": "^7.1.5",
    "joi": "^17.11.0",
    "winston": "^3.11.0",
    "openai": "^4.20.1",
    "@anthropic-ai/sdk": "^0.9.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
```

#### **3. server.js (Exemplo)**
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const workoutRoutes = require('./src/routes/workouts');
const aiRoutes = require('./src/routes/ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:19006'
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    code: 'INTERNAL_SERVER_ERROR'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
```

---

## 📱 Configuração do Frontend

### **Atualizar URLs da API**

#### **1. Criar arquivo de configuração**
```javascript
// src/config/api.js
const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT) || 30000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register'
    },
    WORKOUTS: {
      LIST: '/workout-plans',
      SAVE: '/workout-plans/save',
      DELETE: '/workout-plans'
    },
    AI: {
      GENERATE: '/ai/generate-workout',
      MODIFY: '/ai/modify-workout'
    }
  }
};

export default API_CONFIG;
```

#### **2. Atualizar serviços**
```javascript
// src/services/apiService.js
import API_CONFIG from '../config/api';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro na requisição');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Métodos específicos
  async login(email, password) {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async generateWorkout(userId, prompt, preferences) {
    return this.request(API_CONFIG.ENDPOINTS.AI.GENERATE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await this.getToken()}`
      },
      body: JSON.stringify({ userId, prompt, preferences })
    });
  }
}

export default new ApiService();
```

---

## 🧪 Testes

### **1. Testes de API**
```bash
# Instalar dependências de teste
npm install --save-dev jest supertest

# Executar testes
npm test
```

### **2. Testes de Integração**
```bash
# Testar endpoints
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","password":"senha123","name":"Teste"}'
```

---

## 📊 Monitoramento

### **1. Logs**
```javascript
// src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### **2. Health Check**
```javascript
// Endpoint para monitoramento
app.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: await checkDatabaseConnection()
  };
  
  res.json(health);
});
```

---

## 🚀 Deploy

### **1. Docker (Recomendado)**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3000

CMD ["npm", "start"]
```

### **2. Docker Compose**
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=fitness_app
      - POSTGRES_USER=fitness_user
      - POSTGRES_PASSWORD=senha123
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Esta configuração garante que o backend esteja pronto para integração!** 🎯
