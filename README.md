# 🏋️ TCC Fitness App - React Native + Expo

**Projeto:** Sistema de Gestão de Treinos e Nutrição com Inteligência Artificial  
**Desenvolvedor:** João Marcos Ribeirete  
**Curso:** TCC em Ciência da Computação - PUC-SP  
**Tecnologias:** React Native, Expo, TypeScript, Clean Architecture + MVVM

---

## 📋 Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** (vem com Node.js)
- **Expo Go** app (disponível para Android e iOS)

## ▶️ Execução

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start

# Escanear QR Code com Expo Go
```

---

## 🎯 Status do Projeto

### ✅ Frontend (100% Implementado)
- **Autenticação completa** (Login/Registro com validação)
- **8 telas de treino** implementadas
- **Sistema de salvamento local** (Expo SecureStore)
- **Isolamento de dados por usuário**
- **Navegação completa** (React Navigation)
- **Componentes reutilizáveis**
- **Clean Architecture + MVVM**

### ⏳ Backend (A Implementar)
- **APIs REST** (Python + FastAPI/Flask)
- **Banco de dados** (PostgreSQL)
- **Integração com IA** (OpenAI/Claude)
- **Autenticação JWT** real

---

## 🏗️ Como Estamos Simulando o Backend

### **1. Autenticação Mock**
```typescript
// Repositório em memória
const users = new Map<string, {...}>();

// Retorna token mock: "mock.{userId}"
async login(email, senha) {
  return { token: "mock.abc123" };
}
```

### **2. Dados de Treino Mock**
```typescript
// Arquivo: src/data/mockWorkouts.ts
// 6 rotinas pré-definidas com 36 exercícios
mockWorkouts = {
  upper: { exercises: [...] },
  lower: { exercises: [...] },
  push: { exercises: [...] },
  // ...
};
```

### **3. Armazenamento Local**
```typescript
// Salva planos no SecureStore por usuário
// Chave: "workout_plans_{userId}"
await secure.setItem(`workout_plans_abc123`, JSON.stringify(plans));
```

### **4. Extração de User ID**
```typescript
// Extrai userId do token mock
const token = "mock.abc123";
const userId = token.split('.')[1]; // → "abc123"
```

---

## 📱 Funcionalidades Implementadas

### **Autenticação**
- ✅ Login com email/senha
- ✅ Registro de novos usuários
- ✅ Validação de campos (email, senha, username)
- ✅ Armazenamento seguro de tokens
- ✅ Logout com limpeza de dados

### **Treinos**
- ✅ **HomeScreen** - Lista de planos salvos por usuário
- ✅ **Treino Inteligente** - Formulário de anamnese completo (idade, sexo, peso, experiência, objetivos, equipamentos, etc.)
- ✅ **Visualização de Planos** - Aceitar/Recusar/Alterar treinos gerados
- ✅ **Execução de Treinos** - Tracking de sets e reps
- ✅ **Treino Rápido** - Adicionar exercícios manualmente
- ✅ **Isolamento de dados** - Cada usuário vê apenas seus treinos

---

## 📂 Estrutura do Projeto

```
src/
├── domain/              # 🏛️ Regras de negócio (Clean Architecture)
│   ├── entities/        # Entidades (Usuario, Workout, WorkoutPlan)
│   ├── repositories/    # Interfaces (AuthRepository)
│   └── usecases/        # Casos de uso (LoginUseCase, RegisterUseCase)
├── data/               # 📦 Dados mock
│   └── mockWorkouts.ts  # 36 exercícios pré-definidos
├── infra/              # 🔧 Infraestrutura
│   ├── secureStore.ts  # Armazenamento seguro
│   ├── userService.ts  # Gerenciamento de usuário
│   └── workoutPlanStorage.ts  # Storage isolado por usuário
├── presentation/       # 🎨 Interface (MVVM)
│   ├── auth/          # Telas de autenticação
│   ├── home/          # Tela principal
│   ├── workout/       # 8 telas de treino
│   ├── viewmodels/    # ViewModels (lógica de apresentação)
│   └── components/    # Componentes reutilizáveis
├── di/                # 💉 Injeção de dependências
│   └── container.ts   # Container DI
└── services/          # 🌐 Serviços externos (futuro)
```

---

## 🔐 Como o Token é Usado

### **Formato do Token Mock**
```
"mock.{userId}"
Exemplo: "mock.abc123"
```

### **Onde o Token é Consumido**
1. **Salvar Token:** `src/presentation/viewmodels/AuthViewModel.ts` (linha 100)
2. **Extrair User ID:** `src/infra/workoutPlanStorage.ts` (linha 8-23)
3. **Gerar Chave de Storage:** `workout_plans_{userId}`
4. **Isolar Dados:** Cada usuário tem sua própria chave no SecureStore

---

## 🚀 Próximos Passos (Integração Backend)

### **Para o Desenvolvedor Backend:**
1. Consulte `README_BACKEND.md` para visão geral
2. Consulte `BACKEND_INTEGRATION_GUIDE.md` para APIs detalhadas
3. Consulte `API_EXAMPLES.md` para exemplos práticos
4. Consulte `ENVIRONMENT_SETUP.md` para configuração de ambiente

### **Substituir Mocks por APIs:**
```typescript
// ❌ ATUAL: Mock
const { token } = await inMemoryRepo.login(email, senha);

// ✅ FUTURO: API Real
const { token } = await api.post('/auth/login', { email, senha });
```

---

## 📚 Documentação Completa

- `ARCHITECTURE.md` - Arquitetura MVVM detalhada
- `WORKOUT_STRUCTURE.md` - Estrutura de treinos
- `WORKOUT_USER_ISOLATION.md` - Isolamento de dados
- `BACKEND_INTEGRATION_GUIDE.md` - Guia de integração completo
- `API_EXAMPLES.md` - Exemplos de requisições
- `ENVIRONMENT_SETUP.md` - Configuração de ambiente

---

## 🎯 Conceitos Implementados

### **Clean Architecture**
- ✅ Separação em camadas (Domain, Data, Presentation, Infra)
- ✅ Inversão de dependências
- ✅ Regras de negócio isoladas
- ✅ Testabilidade facilitada

### **MVVM**
- ✅ Views (Telas React Native)
- ✅ ViewModels (Lógica de apresentação)
- ✅ Models (Entidades do domínio)

### **Multi-tenancy**
- ✅ Isolamento de dados por usuário
- ✅ Storage compartimentalizado
- ✅ Validação de propriedade

---

## 📞 Contato

**Desenvolvedor:** João Marcos Ribeirete  
**Projeto:** TCC Fitness App  
**Status:** Frontend 100% implementado, aguardando backend
