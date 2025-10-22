# 🏋️ TCC Fitness App - Guia de Integração Backend

## 📋 Visão Geral do Projeto

**Nome:** TCC Fitness App  
**Tecnologia:** React Native + Expo  
**Arquitetura:** Clean Architecture + MVVM  
**Objetivo:** App de fitness com IA para geração de treinos e dietas personalizados

---

## 🎯 Funcionalidades Implementadas

### 1. **Autenticação**
- Login com email/senha
- Registro de usuários
- Logout com limpeza de dados
- Armazenamento seguro de tokens

### 2. **Geração de Treinos Inteligentes**
- Interface para usuário descrever objetivos
- Simulação de processamento com IA
- Geração de planos de treino personalizados
- Estrutura de dias e exercícios

### 3. **Gestão de Planos de Treino**
- Salvamento de planos por usuário
- Visualização de planos salvos
- Aceitar/Recusar/Alterar treinos gerados
- Execução de treinos com tracking de sets/reps

### 4. **Sistema de Alterações**
- Interface para solicitar mudanças nos treinos
- Simulação de reprocessamento com IA
- Geração de novos treinos baseados em feedback

---

## 🏗️ Arquitetura do Sistema

### **Clean Architecture Layers:**

```
src/
├── domain/           # Regras de negócio
│   ├── entities/     # Entidades (User, Workout, WorkoutPlan)
│   ├── repositories/ # Interfaces de repositórios
│   └── usecases/     # Casos de uso
├── data/            # Camada de dados
│   └── mockWorkouts.ts
├── infra/           # Infraestrutura
│   ├── secureStore.ts
│   └── workoutPlanStorage.ts
├── presentation/    # Interface do usuário
│   ├── auth/        # Telas de login/registro
│   ├── home/        # Tela inicial
│   ├── workout/     # Telas de treino
│   ├── components/  # Componentes reutilizáveis
│   └── viewmodels/  # ViewModels
└── services/        # Serviços externos
    └── exerciseDB.ts
```

---

## 📊 Estruturas de Dados

### **1. Usuário (User)**
```typescript
interface Usuario {
  id: string;
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
}
```

### **2. Exercício (Exercise)**
```typescript
interface Exercise {
  id: string;
  name: string;
  bodyPart: string;        // "Peito", "Costas", "Pernas", etc.
  target: string;          // "Peitoral Maior", "Latíssimo do Dorso", etc.
  equipment: string;       // "Barra", "Halteres", "Máquina", etc.
  gifUrl?: string;         // URL do GIF demonstrativo
  sets?: number;           // Número de séries (ex: 4)
  reps?: string;           // Faixa de repetições (ex: "8-12")
  rest?: string;           // Tempo de descanso (ex: "90s")
}
```

### **3. Rotina de Treino (WorkoutRoutine)**
```typescript
interface WorkoutRoutine {
  id: string;
  name: string;            // "Treino Push", "Treino Pull", etc.
  description: string;     // Descrição do treino
  exercises: Exercise[];   // Lista de exercícios
  duration: string;        // "60-75 min"
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
}
```

### **4. Dia do Plano (WorkoutPlanDay)**
```typescript
interface WorkoutPlanDay {
  id: string;
  dayNumber: number;       // 1, 2, 3, etc.
  routineType: RoutineType; // 'upper', 'lower', 'push', 'pull', 'legs', 'fullbody'
  name: string;            // "Push 1", "Pull 2", etc.
  exercises: Exercise[];   // Exercícios específicos deste dia
  completed?: boolean;     // Se o dia foi completado
}
```

### **5. Plano de Treino (WorkoutPlan)**
```typescript
interface WorkoutPlan {
  id: string;
  name: string;            // "UPPER LOWER", "PUSH PULL LEGS", etc.
  description: string;     // Descrição do plano
  days: WorkoutPlanDay[];  // Dias do plano
  createdAt: Date;         // Data de criação
  userId?: string;         // ID do usuário (para isolamento)
}
```

### **6. Tipos de Rotina**
```typescript
type RoutineType = 'upper' | 'lower' | 'push' | 'pull' | 'legs' | 'fullbody';
```

---

## 🔌 APIs Necessárias

### **1. Autenticação**

#### **POST /auth/login**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "success": true,
  "token": "jwt_token_aqui",
  "user": {
    "id": "user_123",
    "email": "usuario@email.com",
    "name": "João Silva"
  }
}
```

#### **POST /auth/register**
```json
{
  "email": "usuario@email.com",
  "password": "senha123",
  "name": "João Silva"
}
```

**Resposta:**
```json
{
  "success": true,
  "token": "jwt_token_aqui",
  "user": {
    "id": "user_123",
    "email": "usuario@email.com",
    "name": "João Silva"
  }
}
```

### **2. Geração de Treinos com IA**

#### **POST /ai/generate-workout**
```json
{
  "userId": "user_123",
  "prompt": "Quero um treino para ganhar massa muscular, tenho 3 dias por semana para treinar, sou iniciante",
  "preferences": {
    "daysPerWeek": 3,
    "experience": "iniciante",
    "goal": "ganhar_massa",
    "equipment": ["barra", "halteres", "máquina"]
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "workoutPlan": {
    "id": "plan_456",
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

### **3. Alterações de Treinos**

#### **POST /ai/modify-workout**
```json
{
  "userId": "user_123",
  "workoutPlanId": "plan_456",
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
    // ... nova estrutura do treino modificado
  }
}
```

### **4. Gestão de Planos**

#### **GET /workout-plans**
**Headers:** `Authorization: Bearer jwt_token`

**Resposta:**
```json
{
  "success": true,
  "workoutPlans": [
    {
      "id": "plan_456",
      "name": "UPPER LOWER",
      "description": "Treino dividido em membros superiores e inferiores",
      "days": [...],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### **POST /workout-plans/save**
```json
{
  "workoutPlan": {
    // ... estrutura completa do WorkoutPlan
  }
}
```

#### **DELETE /workout-plans/:id**
**Headers:** `Authorization: Bearer jwt_token`

---

## 🤖 Integração com IA

### **Prompt Template para Geração de Treinos**

```
Você é um personal trainer especializado. Crie um plano de treino baseado nas seguintes informações:

OBJETIVO: {goal}
EXPERIÊNCIA: {experience}
DIAS POR SEMANA: {daysPerWeek}
EQUIPAMENTOS DISPONÍVEIS: {equipment}
PREFERÊNCIAS: {preferences}

Crie um plano estruturado com:
1. Divisão de treinos (Upper/Lower, Push/Pull/Legs, Full Body, etc.)
2. Exercícios específicos para cada dia
3. Número de séries e repetições
4. Tempo de descanso
5. Progressão semanal

Retorne no formato JSON seguindo a estrutura WorkoutPlan.
```

### **Exemplo de Prompt Completo**
```
Crie um treino para um usuário iniciante que quer ganhar massa muscular. 
Ele tem 3 dias por semana para treinar e acesso a barra, halteres e máquinas. 
Prefere treinos de 60-75 minutos. Use divisão Upper/Lower.
```

---

## 📱 Fluxos de Navegação

### **1. Fluxo de Geração de Treino**
```
HomeScreen → IntelligentWorkoutScreen → [Loading] → WorkoutPlanScreen → [Aceitar/Recusar/Alterar]
```

### **2. Fluxo de Execução de Treino**
```
HomeScreen → WorkoutPlanScreen → WorkoutDetailScreen → WorkoutExecutionScreen
```

### **3. Fluxo de Alterações**
```
WorkoutPlanScreen → WorkoutAdjustmentsScreen → [Loading] → WorkoutPlanScreen (novo treino)
```

---

## 🔐 Segurança e Autenticação

### **Token JWT**
- **Formato:** `"mock.{userId}"` (atual) → `"jwt_token_real"` (backend)
- **Armazenamento:** Expo SecureStore
- **Validação:** Middleware de autenticação em todas as rotas protegidas

### **Isolamento de Dados**
- Todos os planos de treino são isolados por `userId`
- Validação de propriedade antes de qualquer operação
- Logout limpa todos os dados locais

---

## 📊 Banco de Dados Sugerido

### **Tabelas Principais**

#### **users**
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **workout_plans**
```sql
CREATE TABLE workout_plans (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### **workout_plan_days**
```sql
CREATE TABLE workout_plan_days (
  id VARCHAR(36) PRIMARY KEY,
  workout_plan_id VARCHAR(36) NOT NULL,
  day_number INT NOT NULL,
  routine_type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(id)
);
```

#### **exercises**
```sql
CREATE TABLE exercises (
  id VARCHAR(36) PRIMARY KEY,
  workout_plan_day_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  body_part VARCHAR(100) NOT NULL,
  target VARCHAR(100) NOT NULL,
  equipment VARCHAR(100) NOT NULL,
  sets INT,
  reps VARCHAR(50),
  rest VARCHAR(50),
  gif_url VARCHAR(500),
  FOREIGN KEY (workout_plan_day_id) REFERENCES workout_plan_days(id)
);
```

---

## 🧪 Dados de Teste

### **Exercícios Mock Atuais**
O app já possui uma base de exercícios em `src/data/mockWorkouts.ts` com:
- **6 tipos de rotina:** upper, lower, push, pull, legs, fullbody
- **36 exercícios** diferentes
- **Estrutura completa** com séries, reps, equipamentos

### **Exemplo de Treino Completo (Push)**
```json
{
  "name": "Treino Push",
  "description": "Treino de empurrar - Peito, Ombros e Tríceps",
  "exercises": [
    {
      "name": "Supino Inclinado",
      "bodyPart": "Peito",
      "target": "Peitoral Superior",
      "equipment": "Barra",
      "sets": 4,
      "reps": "8-12",
      "rest": "90s"
    },
    {
      "name": "Supino Reto com Halteres",
      "bodyPart": "Peito",
      "target": "Peitoral Maior",
      "equipment": "Halteres",
      "sets": 3,
      "reps": "10-12",
      "rest": "60s"
    }
    // ... mais 4 exercícios
  ]
}
```

---

## 🚀 Próximos Passos para Integração

### **1. Configuração Inicial**
- [ ] Configurar servidor backend (Node.js/Python/Java)
- [ ] Configurar banco de dados
- [ ] Implementar autenticação JWT
- [ ] Configurar integração com IA (OpenAI/Claude)

### **2. APIs Prioritárias**
- [ ] **POST /auth/login** - Autenticação
- [ ] **POST /auth/register** - Registro
- [ ] **POST /ai/generate-workout** - Geração de treinos
- [ ] **GET /workout-plans** - Listar planos salvos
- [ ] **POST /workout-plans/save** - Salvar plano

### **3. Integração com IA**
- [ ] Configurar API da IA escolhida
- [ ] Criar prompts otimizados para geração de treinos
- [ ] Implementar validação de respostas da IA
- [ ] Adicionar fallbacks para erros da IA

### **4. Testes**
- [ ] Testar autenticação completa
- [ ] Testar geração de treinos com diferentes prompts
- [ ] Testar salvamento e carregamento de planos
- [ ] Testar sistema de alterações

---

## 📞 Contato e Suporte

**Desenvolvedor Frontend:** João Marcos Ribeirete  
**Projeto:** TCC Fitness App  
**Tecnologia:** React Native + Expo  

Para dúvidas sobre a implementação frontend ou estrutura de dados, consulte este documento ou os arquivos do projeto.

---

## 📁 Arquivos Importantes do Projeto

- `src/domain/entities/` - Estruturas de dados principais
- `src/presentation/workout/` - Telas de treino
- `src/presentation/auth/` - Telas de autenticação
- `src/infra/workoutPlanStorage.ts` - Lógica de armazenamento atual
- `src/data/mockWorkouts.ts` - Base de exercícios para referência

**Este documento contém todas as informações necessárias para implementar o backend e integrar com o app frontend!** 🎯
