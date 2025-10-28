# 🏋️ TCC Fitness App - Guia para Desenvolvedor Backend

## 📋 Visão Geral

**Projeto:** App de fitness com IA para geração de treinos personalizados  
**Frontend:** React Native + Expo (✅ 100% implementado)  
**Backend:** Node.js + Express + PostgreSQL + IA (⏳ a implementar)  
**Status:** Frontend completo com simulação de backend, aguardando integração real

---

## 🎯 IMPORTANTE: Como o Frontend Está Funcionando Atualmente

### **⚠️ Simulação Atual (Mocks)**

O frontend **NÃO usa APIs reais**. Está funcionando com simulações locais:

#### **1. Autenticação Mock**
```typescript
// Arquivo: src/domain/repositories/InMemoryAuthRepository.ts
const users = new Map<string, {...}>(); // ← Armazenamento em memória

async login(email, senha) {
  return { token: "mock.abc123" }; // ← Token mock com formato: "mock.{userId}"
}
```

**O que você precisa fazer:** Retornar JWT real no mesmo formato

#### **2. Armazenamento Local (SecureStore)**
```typescript
// Arquivo: src/infra/workoutPlanStorage.ts
// Extrai userId do token: "mock.abc123" → "abc123"
const userId = token.split('.')[1];

// Salva localmente com chave por usuário
await secure.setItem(`workout_plans_${userId}`, JSON.stringify(plans));
```

**O que você precisa fazer:** Frontend vai chamar suas APIs HTTP

#### **3. Dados de Treino Mock**
```typescript
// Arquivo: src/data/mockWorkouts.ts
// 6 rotinas pré-definidas: upper, lower, push, pull, legs, fullbody
// 36 exercícios completos com sets, reps, rest time
```

- Use como referência, não é necessariamente retornar exatamente isso
- Frontend está preparado para receber sua estrutura de dados gerada pela IA  

---

## 🔄 Como Será a Integração (Plano de Migração)

### **Antes (Atual - Mock):**
```typescript
// ✅ JÁ FUNCIONA ASSIM
const users = new Map(); // Armazenamento em memória
const token = "mock." + userId; // Token mock
await secure.setItem('workout_plans_abc123', plans); // Storage local
```

### **Depois (Com Backend Real):**
```typescript
// Você precisa implementar APIs que retornem:
POST /api/auth/login
→ { token: "eyJhbGciOiJIUzI1NiIs..." } // JWT real

POST /api/ai/generate-workout
→ { workoutPlan: {...} } // Plano gerado pela IA

POST /api/workout-plans/save
→ { success: true } // Salva no PostgreSQL
```

### **O Frontend Vai Mudar Para:**
```typescript
// ❌ ATUAL
const { token } = await inMemoryRepo.login(email, senha);

// ✅ FUTURO (após sua implementação)
const { token } = await api.post('/api/auth/login', { email, senha });
```

**Benefício:** As telas e a lógica não mudam, apenas a origem dos dados!

---

## 🔐 Entendendo o Token Atual (Para Migração)

### **Formato do Token Mock**
```
Formato: "mock.{userId}"
Exemplo: "mock.abc123"
```

### **Como o Frontend Usa o Token**
1. **Login/Registro** retorna `{ token: "mock.{userId}" }`
2. **Token salvo** no SecureStore com chave `'auth_token'`
3. **UserId extraído** quando precisa salvar/carregar dados:
   ```typescript
   const userId = token.split('.')[1]; // → "abc123"
   ```
4. **Storage isolado** usando chave `workout_plans_{userId}`

### **O Que Você Precisa Implementar**
```javascript
// Seu JWT deve incluir o userId
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { userId: user.id, email: user.email }, 
  SECRET_KEY
);

// Frontend vai continuar funcionando normalmente
// Pois vai receber o userId do JWT decodificado
```

---

## 📊 Estrutura de Dados Esperada

### **Auth Response (Login/Register)**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "joao@email.com",
    "nome": "João Silva",
    "username": "joao123"
  }
}
```

### **Generate Workout Request**
```json
{
  "userId": "user_123",
  "formData": {
    "idade": "25",
    "sexo": "Masculino",
    "peso": "75.5",
    "experiencia": "Intermediário",
    "diasSemana": "3 dias",
    "objetivos": ["Ganhar massa muscular", "Aumentar força"],
    "equipamentos": ["Barra", "Halteres", "Máquina"],
    // ... todos os campos do formulário
  }
}
```

### **Generate Workout Response**
```json
{
  "success": true,
  "workoutPlan": {
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
          {
            "id": "ex_1",
            "name": "Supino Reto com Barra",
            "bodyPart": "Peito",
            "target": "Peitoral Maior",
            "equipment": "Barra",
            "sets": 4,
            "reps": "8-12",
            "rest": "90s"
          }
          // ... mais exercícios
        ]
      }
      // ... mais dias
    ],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Importante:** A estrutura está nos arquivos TypeScript, você pode consultar:
- `src/domain/entities/Workout.ts` - Interfaces de Exercise
- `src/domain/entities/WorkoutPlan.ts` - Interfaces de Plan
- `src/domain/entities/QuickWorkout.ts` - Interfaces de QuickWorkout

---

## 🏃 Funcionalidades Adicionais (QuickWorkout + Tracking)

### **QuickWorkout - Estrutura de Dados**

#### **QuickWorkoutSet**
```typescript
interface QuickWorkoutSet {
  setId: string;
  setNumber: number;
  weight: number;      // kg
  reps: number;
  rir?: number;        // Reps In Reserve (opcional)
  completed: boolean;
}
```

#### **QuickWorkoutExercise**
```typescript
interface QuickWorkoutExercise {
  id: string;
  exerciseId: string;  // ID do exercício da base de dados
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  sets: QuickWorkoutSet[];
}
```

#### **QuickWorkout (Treino Completo)**
```typescript
interface QuickWorkout {
  id: string;
  userId: string;
  exercises: QuickWorkoutExercise[];
  startTime: Date;
  endTime: Date;
  elapsedTime: number;  // segundos
  totalVolume: number;  // kg (soma de weight * reps)
  completedSets: number;
  totalSets: number;
  notes?: string;
}
```

### **Histórico de Treino - Estrutura**

```typescript
interface WorkoutHistory {
  id: string;
  userId: string;
  workoutPlanId?: string;      // Se foi de um plano salvo
  workoutType: 'planned' | 'quick';  // Tipo de treino
  workoutName: string;
  dayName?: string;            // Se foi de um dia específico
  exercises: QuickWorkoutExercise[];
  startTime: Date;
  endTime: Date;
  elapsedTime: number;
  totalVolume: number;
  completedSets: number;
  totalSets: number;
  notes?: string;
}
```

### **Exemplos de Requisições**

#### **1. GET /api/exercises** - Listar Exercícios
```http
GET /api/exercises
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "exercises": [
    {
      "id": "ex_1",
      "name": "Supino Reto com Barra",
      "bodyPart": "Peito",
      "target": "Peitoral Maior",
      "equipment": "Barra",
      "gifUrl": "https://..."
    },
    // ... mais exercícios
  ]
}
```

#### **2. GET /api/exercises/search?q=supino** - Buscar Exercícios
```http
GET /api/exercises/search?q=supino&muscleGroup=Peito
Authorization: Bearer {token}
```

**Resposta:** Lista filtrada de exercícios

#### **3. POST /api/quick-workouts/save** - Salvar Treino Rápido
```http
POST /api/quick-workouts/save
Authorization: Bearer {token}
Content-Type: application/json

{
  "exercises": [
    {
      "exerciseId": "ex_1",
      "name": "Supino Reto",
      "bodyPart": "Peito",
      "target": "Peitoral",
      "equipment": "Barra",
      "sets": [
        {
          "setNumber": 1,
          "weight": 80,
          "reps": 10,
          "completed": true
        },
        {
          "setNumber": 2,
          "weight": 80,
          "reps": 8,
          "completed": true
        }
      ]
    }
  ],
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T10:45:00Z",
  "elapsedTime": 2700,
  "totalVolume": 1440,
  "completedSets": 2,
  "totalSets": 2,
  "notes": "Treino de peito leve"
}
```

**Resposta:**
```json
{
  "success": true,
  "workoutId": "quick_123",
  "message": "Treino salvo com sucesso"
}
```

#### **4. POST /api/workout-history** - Salvar Execução de Plano
```http
POST /api/workout-history
Authorization: Bearer {token}

{
  "workoutPlanId": "plan_789",
  "dayId": "day_1",
  "workoutType": "planned",
  "workoutName": "UPPER LOWER",
  "dayName": "Upper 1",
  "exercises": [...],
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "elapsedTime": 3600,
  "totalVolume": 5000,
  "completedSets": 15,
  "totalSets": 18
}
```

#### **5. GET /api/workout-history** - Listar Histórico
```http
GET /api/workout-history?limit=20&offset=0
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "history": [
    {
      "id": "history_1",
      "workoutType": "planned",
      "workoutName": "Upper 1",
      "date": "2024-01-15",
      "elapsedTime": 3600,
      "totalVolume": 5000,
      "completedSets": 15
    },
    {
      "id": "history_2",
      "workoutType": "quick",
      "workoutName": "Treino Rápido",
      "date": "2024-01-14",
      "elapsedTime": 2700,
      "totalVolume": 1440,
      "completedSets": 8
    }
  ],
  "total": 25
}
```

---

## 🎯 O Que Precisa Ser Implementado

### **1. APIs Essenciais (Prioridade Alta)**
- ✅ **Autenticação** - Login/Registro com JWT
- ✅ **Geração de Treinos** - Integração com IA (OpenAI/Claude)
- ✅ **Gestão de Planos** - CRUD de planos de treino
- ✅ **Alterações de Treinos** - Reprocessamento com IA

### **2. Banco de Dados**
- ✅ **PostgreSQL** com 4 tabelas principais
- ✅ **Isolamento por usuário** (todos os dados são específicos do usuário)
- ✅ **Estrutura completa** já definida

### **3. Integração com IA**
- ✅ **Prompts otimizados** para geração de treinos
- ✅ **Estrutura de resposta** padronizada
- ✅ **Fallbacks** para erros da IA

---

## 📊 Estrutura de Dados (Já Definida)

### **Entidades Principais**
```typescript
User {
  id: string
  email: string
  password: string (hash)
  name: string
}

WorkoutPlan {
  id: string
  userId: string
  name: string
  description: string
  days: WorkoutPlanDay[]
}

WorkoutPlanDay {
  id: string
  dayNumber: number
  routineType: 'upper'|'lower'|'push'|'pull'|'legs'|'fullbody'
  name: string
  exercises: Exercise[]
}

Exercise {
  id: string
  name: string
  bodyPart: string
  target: string
  equipment: string
  sets: number
  reps: string
  rest: string
}
```

---

## 🔌 APIs Necessárias

### **1. Autenticação**
```
POST /api/auth/login
POST /api/auth/register
```

### **2. Geração de Treinos**
```
POST /api/ai/generate-workout
POST /api/ai/modify-workout
```

### **3. Gestão de Planos**
```
GET /api/workout-plans
POST /api/workout-plans/save
DELETE /api/workout-plans/:id
```

### **4. Treino Rápido (QuickWorkout)** ⚠️ NOVO
```
GET /api/exercises          # Listar exercícios disponíveis
GET /api/exercises/search   # Buscar exercícios por nome/músculo
POST /api/quick-workouts/save  # Salvar treino rápido concluído
```

### **5. Histórico de Treinos** ⚠️ NOVO
```
GET /api/workout-history           # Listar treinos executados
POST /api/workout-history          # Salvar execução de treino
GET /api/workout-history/:id       # Detalhes de um treino executado
```

---

## 🤖 Integração com IA

### **Prompt Template**
```
Você é um personal trainer especializado. Crie um plano de treino baseado em:
- OBJETIVO: {goal}
- EXPERIÊNCIA: {experience}
- DIAS POR SEMANA: {daysPerWeek}
- EQUIPAMENTOS: {equipment}

Retorne JSON com estrutura WorkoutPlan.
```

### **Exemplo de Resposta da IA**
```json
{
  "name": "UPPER LOWER",
  "description": "Treino dividido em membros superiores e inferiores",
  "days": [
    {
      "dayNumber": 1,
      "routineType": "upper",
      "name": "Upper 1",
      "exercises": [
        {
          "name": "Supino Reto com Barra",
          "bodyPart": "Peito",
          "target": "Peitoral Maior",
          "equipment": "Barra",
          "sets": 4,
          "reps": "8-12",
          "rest": "90s"
        }
      ]
    }
  ]
}
```

---

## 📱 Frontend (Já Implementado)

### **Telas Principais**
- ✅ **Login/Registro** - Autenticação completa
- ✅ **Home** - Lista de planos salvos
- ✅ **Geração de Treinos** - Interface para descrever objetivos
- ✅ **Visualização de Treinos** - Aceitar/Recusar/Alterar
- ✅ **Execução de Treinos** - Tracking de sets/reps
- ✅ **Sistema de Alterações** - Solicitar mudanças

### **Funcionalidades**
- ✅ **Armazenamento local** (Expo SecureStore)
- ✅ **Navegação** (React Navigation)
- ✅ **Validação de formulários**
- ✅ **Modais de feedback**
- ✅ **Loading states**
- ✅ **Tratamento de erros**

---

## 🚀 Próximos Passos

### **1. Configuração Inicial (1-2 dias)**
- [ ] Configurar servidor Node.js + Express
- [ ] Configurar PostgreSQL
- [ ] Implementar autenticação JWT
- [ ] Configurar CORS e middleware

### **2. APIs Básicas (2-3 dias)**
- [ ] Implementar CRUD de usuários
- [ ] Implementar CRUD de planos de treino
- [ ] Implementar validação de dados
- [ ] Implementar tratamento de erros

### **3. Integração com IA (2-3 dias)**
- [ ] Configurar OpenAI/Claude
- [ ] Implementar geração de treinos
- [ ] Implementar sistema de alterações
- [ ] Implementar fallbacks para erros

### **4. Testes e Deploy (1-2 dias)**
- [ ] Testes de integração
- [ ] Configurar ambiente de produção
- [ ] Deploy do backend
- [ ] Testes finais com frontend

---

## 📁 Arquivos de Referência

### **Documentação Completa**
- `BACKEND_INTEGRATION_GUIDE.md` - Guia completo de integração
- `API_EXAMPLES.md` - Exemplos de requisições/respostas
- `ENVIRONMENT_SETUP.md` - Configuração de ambiente

### **Código Frontend**
- `src/domain/entities/` - Estruturas de dados
- `src/presentation/` - Telas e componentes
- `src/infra/` - Lógica de armazenamento atual

---

## 🎯 Objetivos do TCC

### **Tecnologias**
- **Frontend:** React Native + Expo
- **Backend:** Node.js + Express
- **Banco:** PostgreSQL
- **IA:** OpenAI GPT-4 ou Claude
- **Arquitetura:** Clean Architecture + MVVM

### **Funcionalidades Principais**
1. **Geração de treinos personalizados** com IA
2. **Sistema de alterações** baseado em feedback
3. **Tracking de execução** de treinos
4. **Isolamento de dados** por usuário
5. **Interface intuitiva** e responsiva

---

## 📞 Suporte

**Desenvolvedor Frontend:** João Marcos Ribeirete  
**Projeto:** TCC Fitness App  
**Status:** Frontend 100% implementado, aguardando backend  

**Para dúvidas sobre:**
- Estrutura de dados → Consulte `BACKEND_INTEGRATION_GUIDE.md`
- Exemplos de APIs → Consulte `API_EXAMPLES.md`
- Configuração → Consulte `ENVIRONMENT_SETUP.md`
- Código frontend → Consulte arquivos em `src/`

---

## ✅ Checklist de Implementação

### **Backend Básico**
- [ ] Servidor Express configurado
- [ ] PostgreSQL configurado
- [ ] Autenticação JWT implementada
- [ ] CRUD de usuários implementado
- [ ] CRUD de planos implementado

### **Integração IA**
- [ ] OpenAI/Claude configurado
- [ ] Geração de treinos implementada
- [ ] Sistema de alterações implementado
- [ ] Prompts otimizados criados

### **APIs**
#### **Autenticação**
- [ ] POST /api/auth/login
- [ ] POST /api/auth/register

#### **Treinos Inteligentes (IA)**
- [ ] POST /api/ai/generate-workout
- [ ] POST /api/ai/modify-workout

#### **Planos de Treino**
- [ ] GET /api/workout-plans
- [ ] POST /api/workout-plans/save
- [ ] DELETE /api/workout-plans/:id

#### **Treino Rápido**
- [ ] GET /api/exercises
- [ ] GET /api/exercises/search
- [ ] POST /api/quick-workouts/save

#### **Histórico**
- [ ] GET /api/workout-history
- [ ] POST /api/workout-history
- [ ] GET /api/workout-history/:id

### **Testes**
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes com frontend
- [ ] Deploy em produção

---

## ✅ Resumo Executivo para Backend

### **O Que Já Existe (Frontend)**

#### **Telas Implementadas (8 telas de workout)**
1. ✅ **HomeScreen** - Lista planos salvos + botões de ação
2. ✅ **IntelligentWorkoutScreen** - Formulário completo de anamnese
3. ✅ **WorkoutPlanScreen** - Visualizar/Aceitar/Recusar plano gerado
4. ✅ **WorkoutDetailScreen** - Detalhes de um plano específico
5. ✅ **WorkoutExecutionScreen** - Executar treino com tracking de sets/reps
6. ✅ **QuickWorkoutScreen** - Treino rápido (adicionar exercícios manualmente)
7. ✅ **WorkoutAdjustmentsScreen** - Solicitar alterações no plano
8. ✅ **WorkoutSummaryScreen** - Resumo do treino executado

#### **Funcionalidades**
- ✅ **Autenticação** - Login/Registro com validação completa
- ✅ **Treino Inteligente** - Formulário de anamnese completo (15+ campos)
- ✅ **Salvamento de Planos** - Aceitar/Recusar/Ajustar planos
- ✅ **Treino Rápido** - Adicionar exercícios + sets manualmente
- ✅ **Tracking de Sets** - Peso, reps, completado/não-completado
- ✅ **Timer de Treino** - Tracking de tempo em tempo real
- ✅ **Cálculo de Volume** - Total de kg movidos (peso × reps)
- ✅ **Adicionar Sets** - Adicionar/remover sets dinamicamente
- ✅ **Histórico** - Visualizar resumo de treinos executados
- ✅ **Busca de Exercícios** - Por nome ou grupo muscular
- ✅ **Isolamento de Dados** - Por usuário (multi-tenancy)
- ✅ **Navegação Completa** - React Navigation com tabs e stack
- ✅ **Modais de Feedback** - Sucesso, erro, confirmação
- ✅ **Loading States** - Feedback visual durante operações
- ✅ **Tratamento de Erros** - Validação e mensagens amigáveis

### **O Que Você Precisa Fazer (Backend)**

#### **Setup Básico**
- ⏳ Criar servidor Node.js + Express
- ⏳ Configurar PostgreSQL
- ⏳ Implementar autenticação JWT
- ⏳ Configurar CORS, middlewares e validações

#### **Integração com IA**
- ⏳ Integrar com OpenAI/Claude
- ⏳ Criar prompts para geração de treinos
- ⏳ Implementar sistema de alterações

#### **APIs para Implementar (13 endpoints)**
1. ⏳ POST /api/auth/login
2. ⏳ POST /api/auth/register
3. ⏳ POST /api/ai/generate-workout
4. ⏳ POST /api/ai/modify-workout
5. ⏳ GET /api/workout-plans
6. ⏳ POST /api/workout-plans/save
7. ⏳ DELETE /api/workout-plans/:id
8. ⏳ GET /api/exercises (lista de exercícios)
9. ⏳ GET /api/exercises/search (busca)
10. ⏳ POST /api/quick-workouts/save
11. ⏳ GET /api/workout-history
12. ⏳ POST /api/workout-history
13. ⏳ GET /api/workout-history/:id

#### **Banco de Dados (6 tabelas)**
- ⏳ users (usuários)
- ⏳ workout_plans (planos)
- ⏳ workout_plan_days (dias do plano)
- ⏳ exercises (exercícios)
- ⏳ quick_workouts (treinos rápidos)
- ⏳ workout_history (histórico)

### **Como Funciona a Integração**
1. Frontend chama suas APIs HTTP
2. Você retorna dados no formato esperado
3. Frontend continua funcionando igual
4. Apenas troca de origem dos dados (local → servidor)

### **Arquivos Importantes do Frontend**
```
src/domain/entities/
  - Workout.ts          ← Interfaces de Exercise, WorkoutRoutine
  - WorkoutPlan.ts      ← Interfaces de WorkoutPlan, WorkoutPlanDay
  - Usuario.ts          ← Interface de User
  - AuthRepository.ts   ← Interface de autenticação

src/data/
  - mockWorkouts.ts     ← Dados de referência (36 exercícios)

src/infra/
  - workoutPlanStorage.ts  ← Como estamos armazenando atualmente
  - secureStore.ts         ← Como o token é salvo/carregado

src/presentation/workout/
  - IntelligentWorkoutScreen.tsx  ← Formulário completo que vai enviar pra você
  - WorkoutPlanScreen.tsx         ← Tela que exibe o plano gerado
```

### **Próximos Passos**
1. ✅ Leia este README_BACKEND.md
2. ✅ Leia BACKEND_INTEGRATION_GUIDE.md (detalhes das APIs)
3. ✅ Leia API_EXAMPLES.md (exemplos práticos)
4. ✅ Leia ENVIRONMENT_SETUP.md (configuração)
5. ✅ Implemente as APIs
6. ✅ Teste com Postman/Insomnia
7. ✅ Integre com frontend
8. ✅ Testes finais

**Com esta documentação, você tem tudo que precisa para implementar a integração completa!** 🎯

---

## 📞 Suporte

Para dúvidas sobre:
- **Estrutura de dados** → Consulte os arquivos em `src/domain/entities/`
- **APIs detalhadas** → `BACKEND_INTEGRATION_GUIDE.md`
- **Exemplos práticos** → `API_EXAMPLES.md`
- **Configuração** → `ENVIRONMENT_SETUP.md`
- **Isolamento de dados** → `WORKOUT_USER_ISOLATION.md`
