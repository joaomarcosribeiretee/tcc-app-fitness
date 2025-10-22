# 🔌 Exemplos de APIs - TCC Fitness App

## 📋 Exemplos Práticos de Requisições e Respostas

### **1. Autenticação**

#### **Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "joao@email.com",
    "name": "João Silva"
  }
}
```

**Resposta de Erro:**
```json
{
  "success": false,
  "error": "Credenciais inválidas",
  "code": "INVALID_CREDENTIALS"
}
```

#### **Registro**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "maria@email.com",
  "password": "senha456",
  "name": "Maria Santos"
}
```

**Resposta:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_456",
    "email": "maria@email.com",
    "name": "Maria Santos"
  }
}
```

---

### **2. Geração de Treinos com IA**

#### **Treino Básico - Iniciante**
```bash
POST /api/ai/generate-workout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "userId": "user_123",
  "prompt": "Quero um treino para ganhar massa muscular, tenho 3 dias por semana para treinar, sou iniciante",
  "preferences": {
    "daysPerWeek": 3,
    "experience": "iniciante",
    "goal": "ganhar_massa",
    "equipment": ["barra", "halteres", "máquina"],
    "duration": "60-75 min"
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "workoutPlan": {
    "id": "plan_789",
    "name": "UPPER LOWER",
    "description": "Treino dividido em membros superiores e inferiores - ideal para iniciantes",
    "days": [
      {
        "id": "day_1",
        "dayNumber": 1,
        "routineType": "upper",
        "name": "Upper 1",
        "exercises": [
          {
            "id": "ex_1",
            "name": "Supino Reto com Barra",
            "bodyPart": "Peito",
            "target": "Peitoral Maior",
            "equipment": "Barra",
            "sets": 4,
            "reps": "8-12",
            "rest": "90s"
          },
          {
            "id": "ex_2",
            "name": "Puxada Frontal",
            "bodyPart": "Costas",
            "target": "Latíssimo do Dorso",
            "equipment": "Máquina",
            "sets": 4,
            "reps": "10-12",
            "rest": "60s"
          },
          {
            "id": "ex_3",
            "name": "Desenvolvimento com Halteres",
            "bodyPart": "Ombros",
            "target": "Deltoide",
            "equipment": "Halteres",
            "sets": 3,
            "reps": "10-12",
            "rest": "60s"
          },
          {
            "id": "ex_4",
            "name": "Remada Curvada",
            "bodyPart": "Costas",
            "target": "Trapézio Médio",
            "equipment": "Barra",
            "sets": 4,
            "reps": "10-12",
            "rest": "60s"
          },
          {
            "id": "ex_5",
            "name": "Rosca Direta com Barra",
            "bodyPart": "Braços",
            "target": "Bíceps",
            "equipment": "Barra",
            "sets": 3,
            "reps": "10-15",
            "rest": "45s"
          },
          {
            "id": "ex_6",
            "name": "Tríceps Pulley",
            "bodyPart": "Braços",
            "target": "Tríceps",
            "equipment": "Cabo",
            "sets": 3,
            "reps": "12-15",
            "rest": "45s"
          }
        ]
      },
      {
        "id": "day_2",
        "dayNumber": 2,
        "routineType": "lower",
        "name": "Lower 1",
        "exercises": [
          {
            "id": "ex_7",
            "name": "Agachamento Livre",
            "bodyPart": "Pernas",
            "target": "Quadríceps",
            "equipment": "Barra",
            "sets": 4,
            "reps": "8-12",
            "rest": "120s"
          },
          {
            "id": "ex_8",
            "name": "Leg Press 45°",
            "bodyPart": "Pernas",
            "target": "Quadríceps",
            "equipment": "Máquina",
            "sets": 4,
            "reps": "12-15",
            "rest": "90s"
          },
          {
            "id": "ex_9",
            "name": "Cadeira Extensora",
            "bodyPart": "Pernas",
            "target": "Quadríceps",
            "equipment": "Máquina",
            "sets": 3,
            "reps": "12-15",
            "rest": "60s"
          },
          {
            "id": "ex_10",
            "name": "Mesa Flexora",
            "bodyPart": "Pernas",
            "target": "Posterior de Coxa",
            "equipment": "Máquina",
            "sets": 3,
            "reps": "12-15",
            "rest": "60s"
          },
          {
            "id": "ex_11",
            "name": "Stiff",
            "bodyPart": "Pernas",
            "target": "Posterior de Coxa",
            "equipment": "Barra",
            "sets": 3,
            "reps": "10-12",
            "rest": "90s"
          },
          {
            "id": "ex_12",
            "name": "Panturrilha em Pé",
            "bodyPart": "Pernas",
            "target": "Panturrilha",
            "equipment": "Máquina",
            "sets": 4,
            "reps": "15-20",
            "rest": "45s"
          }
        ]
      },
      {
        "id": "day_3",
        "dayNumber": 3,
        "routineType": "upper",
        "name": "Upper 2",
        "exercises": [
          // Exercícios similares ao Upper 1 com variações
        ]
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### **Treino Avançado - PPL**
```bash
POST /api/ai/generate-workout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "userId": "user_123",
  "prompt": "Quero um treino Push/Pull/Legs para ganhar massa muscular, tenho 6 dias por semana, sou avançado",
  "preferences": {
    "daysPerWeek": 6,
    "experience": "avancado",
    "goal": "ganhar_massa",
    "equipment": ["barra", "halteres", "máquina", "cabo"],
    "duration": "75-90 min"
  }
}
```

**Resposta (estrutura similar, mas com 6 dias PPL):**
```json
{
  "success": true,
  "workoutPlan": {
    "id": "plan_890",
    "name": "PUSH PULL LEGS",
    "description": "Divisão clássica de empurrar, puxar e pernas - ideal para avançados",
    "days": [
      {
        "id": "day_1",
        "dayNumber": 1,
        "routineType": "push",
        "name": "Push 1",
        "exercises": [
          // Exercícios de peito, ombros e tríceps
        ]
      },
      {
        "id": "day_2",
        "dayNumber": 2,
        "routineType": "pull",
        "name": "Pull 1",
        "exercises": [
          // Exercícios de costas e bíceps
        ]
      },
      {
        "id": "day_3",
        "dayNumber": 3,
        "routineType": "legs",
        "name": "Legs 1",
        "exercises": [
          // Exercícios de pernas
        ]
      }
      // ... mais 3 dias (Push 2, Pull 2, Legs 2)
    ],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### **3. Alterações de Treinos**

#### **Modificar Treino Existente**
```bash
POST /api/ai/modify-workout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "userId": "user_123",
  "workoutPlanId": "plan_789",
  "modificationPrompt": "Quero trocar o treino Upper/Lower por Push/Pull/Legs, mas manter os mesmos exercícios de peito",
  "originalWorkout": {
    // ... estrutura completa do treino original
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "modifiedWorkoutPlan": {
    "id": "plan_891",
    "name": "PUSH PULL LEGS",
    "description": "Treino modificado baseado no seu feedback - mantendo exercícios de peito",
    "days": [
      // ... nova estrutura PPL com exercícios de peito mantidos
    ],
    "createdAt": "2024-01-15T11:00:00Z"
  }
}
```

---

### **4. Gestão de Planos**

#### **Listar Planos Salvos**
```bash
GET /api/workout-plans
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta:**
```json
{
  "success": true,
  "workoutPlans": [
    {
      "id": "plan_789",
      "name": "UPPER LOWER",
      "description": "Treino dividido em membros superiores e inferiores",
      "days": [
        {
          "id": "day_1",
          "dayNumber": 1,
          "routineType": "upper",
          "name": "Upper 1",
          "exercises": [
            // ... exercícios do dia
          ]
        }
        // ... mais dias
      ],
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "plan_890",
      "name": "PUSH PULL LEGS",
      "description": "Divisão clássica de empurrar, puxar e pernas",
      "days": [
        // ... estrutura do PPL
      ],
      "createdAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

#### **Salvar Plano**
```bash
POST /api/workout-plans/save
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "workoutPlan": {
    "id": "plan_789",
    "name": "UPPER LOWER",
    "description": "Treino dividido em membros superiores e inferiores",
    "days": [
      // ... estrutura completa do plano
    ],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Plano de treino salvo com sucesso",
  "workoutPlanId": "plan_789"
}
```

#### **Deletar Plano**
```bash
DELETE /api/workout-plans/plan_789
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta:**
```json
{
  "success": true,
  "message": "Plano de treino removido com sucesso"
}
```

---

### **5. Tratamento de Erros**

#### **Erro de Autenticação**
```json
{
  "success": false,
  "error": "Token inválido ou expirado",
  "code": "INVALID_TOKEN",
  "statusCode": 401
}
```

#### **Erro de Validação**
```json
{
  "success": false,
  "error": "Dados inválidos",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Email é obrigatório"
    },
    {
      "field": "password",
      "message": "Senha deve ter no mínimo 6 caracteres"
    }
  ],
  "statusCode": 400
}
```

#### **Erro da IA**
```json
{
  "success": false,
  "error": "Erro ao gerar treino com IA",
  "code": "AI_GENERATION_ERROR",
  "details": "Falha na comunicação com o serviço de IA",
  "statusCode": 500
}
```

#### **Erro de Recurso Não Encontrado**
```json
{
  "success": false,
  "error": "Plano de treino não encontrado",
  "code": "WORKOUT_PLAN_NOT_FOUND",
  "statusCode": 404
}
```

---

### **6. Headers Obrigatórios**

#### **Todas as Requisições**
```http
Content-Type: application/json
User-Agent: TCC-Fitness-App/1.0.0
```

#### **Requisições Autenticadas**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
User-Agent: TCC-Fitness-App/1.0.0
```

---

### **7. Códigos de Status HTTP**

- **200** - Sucesso
- **201** - Criado com sucesso
- **400** - Dados inválidos
- **401** - Não autenticado
- **403** - Não autorizado
- **404** - Recurso não encontrado
- **500** - Erro interno do servidor

---

### **8. Rate Limiting**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

---

## 🧪 Testes com Postman/Insomnia

### **Coleção de Testes**

1. **Autenticação**
   - POST /api/auth/register
   - POST /api/auth/login

2. **Geração de Treinos**
   - POST /api/ai/generate-workout (iniciante)
   - POST /api/ai/generate-workout (avançado)

3. **Gestão de Planos**
   - GET /api/workout-plans
   - POST /api/workout-plans/save
   - DELETE /api/workout-plans/:id

4. **Alterações**
   - POST /api/ai/modify-workout

**Estes exemplos cobrem todos os cenários principais do app!** 🎯
