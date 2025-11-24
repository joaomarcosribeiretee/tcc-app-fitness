# 🔐 Isolamento de Treinos por Usuário

## 📋 Visão Geral

Este documento descreve a implementação do **isolamento de dados de treino por usuário**, garantindo que cada usuário tenha seus próprios planos de treino independentes.

---

## 🐛 Problemas Corrigidos

### **Problema 1: Botão "SALVANDO..." eternamente**

**Causa:**
- O estado `isSaving` nunca era resetado para `false` após o salvamento bem-sucedido
- Apenas era resetado em caso de erro
- Resultado: botão ficava travado e usuário não conseguia interagir novamente

**Solução:**
```typescript
// ✅ Resetar o estado ANTES da navegação
setIsSaving(false);

// Navegar para a tela principal
navigation.reset({
  index: 0,
  routes: [{ name: 'Main', params: { screen: 'Workout' } }],
});
```

**Conceitos aplicados:**
- **State Management**: Gerenciamento correto do ciclo de vida do estado
- **Error Handling**: Garantir que o estado seja resetado em TODOS os caminhos (sucesso e erro)

---

### **Problema 2: Treinos compartilhados entre usuários**

**Causa:**
- Os treinos eram salvos em uma chave global `workout_plans`
- Todos os usuários compartilhavam a mesma lista de treinos
- Ao fazer logout e logar com outro usuário, os treinos do usuário anterior continuavam visíveis

**Solução:**
Implementação de **storage isolado por usuário** usando o `userId` extraído do token de autenticação.

---

## 🏗️ Arquitetura da Solução

### **1. Extração do User ID do Token**

O sistema de autenticação mock usa tokens no formato: `"mock.{userId}"`

```typescript
/**
 * Extrai o userId do token
 * Token format: "mock.{userId}"
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const token = await secure.getItem('auth_token');
    if (!token) return null;
    
    // Extrai o userId do token (formato: "mock.{userId}")
    const parts = token.split('.');
    if (parts.length >= 2) {
      return parts[1]; // Retorna o userId
    }
    return null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}
```

**Por que isso funciona:**
- O `InMemoryAuthRepository` retorna tokens no formato `"mock.{userId}"`
- Cada usuário tem um ID único gerado aleatoriamente
- O userId é extraído do token e usado para criar chaves de storage únicas

---

### **2. Storage Key Personalizado**

Cada usuário tem sua própria chave de armazenamento:

```typescript
/**
 * Gera a chave de storage específica para o usuário
 */
function getUserStorageKey(userId: string): string {
  return `workout_plans_${userId}`;
}
```

**Exemplos:**
- Usuário 1 (ID: `abc123`): `workout_plans_abc123`
- Usuário 2 (ID: `xyz789`): `workout_plans_xyz789`

**Resultado:**
- ✅ Dados completamente isolados
- ✅ Usuários não veem treinos de outros usuários
- ✅ Logout não afeta os dados salvos

---

### **3. Funções de Storage Atualizadas**

Todas as funções foram modificadas para usar o `userId`:

#### **saveWorkoutPlans()**
```typescript
export async function saveWorkoutPlans(plans: WorkoutPlan[]): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Usuário não autenticado');
  }
  
  const storageKey = getUserStorageKey(userId);
  await secure.setItem(storageKey, JSON.stringify(plans));
  console.log(`Saved ${plans.length} plans for user ${userId}`);
}
```

#### **loadWorkoutPlans()**
```typescript
export async function loadWorkoutPlans(): Promise<WorkoutPlan[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.log('No user logged in, returning empty plans');
    return [];
  }
  
  const storageKey = getUserStorageKey(userId);
  const json = await secure.getItem(storageKey);
  
  if (!json) {
    console.log(`No plans found for user ${userId}`);
    return [];
  }
  
  return JSON.parse(json);
}
```

#### **addWorkoutPlan()**
```typescript
export async function addWorkoutPlan(plan: WorkoutPlan): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Usuário não autenticado');
  }
  
  console.log(`Adding plan "${plan.name}" for user ${userId}`);
  const plans = await loadWorkoutPlans();
  plans.push(plan);
  await saveWorkoutPlans(plans);
}
```

---

## 🔄 Fluxo de Dados

```
┌─────────────────────────────────────────────────┐
│  1. Usuário faz login                          │
│  → Token salvo: "mock.abc123"                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  2. Usuário cria/salva um treino               │
│  → getCurrentUserId() extrai "abc123" do token │
│  → Storage key: "workout_plans_abc123"         │
│  → Salva no SecureStore                        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  3. HomeScreen carrega treinos                 │
│  → loadWorkoutPlans() usa userId automaticamente│
│  → Carrega apenas treinos desse usuário        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  4. Usuário faz logout                         │
│  → Token removido                              │
│  → Treinos permanecem salvos no storage        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  5. Outro usuário faz login                    │
│  → Novo token: "mock.xyz789"                   │
│  → Storage key: "workout_plans_xyz789"         │
│  → Vê apenas seus próprios treinos             │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Boas Práticas Implementadas

### **1. Separação de Responsabilidades**

```
┌─────────────────────────────────────────────┐
│  INFRA LAYER                                │
│  ├── workoutPlanStorage.ts                 │
│  │   ├── getCurrentUserId()    [PRIVADA]   │
│  │   ├── getUserStorageKey()   [PRIVADA]   │
│  │   ├── saveWorkoutPlans()    [PÚBLICA]   │
│  │   ├── loadWorkoutPlans()    [PÚBLICA]   │
│  │   └── addWorkoutPlan()      [PÚBLICA]   │
│  └── secureStore.ts                         │
└─────────────────────────────────────────────┘
                    ↑
                    │ usa
                    │
┌─────────────────────────────────────────────┐
│  PRESENTATION LAYER                         │
│  ├── WorkoutPlanScreen.tsx                 │
│  └── HomeScreen.tsx                         │
└─────────────────────────────────────────────┘
```

**Vantagens:**
- ✅ Views não conhecem a lógica de extração de userId
- ✅ Lógica de storage centralizada em um único arquivo
- ✅ Fácil manutenção e teste
- ✅ Possível migrar para backend real sem alterar as Views

---

### **2. Encapsulamento**

Funções privadas (`getCurrentUserId`, `getUserStorageKey`) não são exportadas:

```typescript
// ❌ NÃO EXPORTADAS - uso interno apenas
async function getCurrentUserId(): Promise<string | null> { ... }
function getUserStorageKey(userId: string): string { ... }

// ✅ EXPORTADAS - interface pública
export async function saveWorkoutPlans(plans: WorkoutPlan[]): Promise<void> { ... }
export async function loadWorkoutPlans(): Promise<WorkoutPlan[]> { ... }
export async function addWorkoutPlan(plan: WorkoutPlan): Promise<void> { ... }
```

**Benefícios:**
- API simples para os consumidores
- Implementação interna pode mudar sem afetar o código externo
- Menor superfície de ataque (menos funções expostas)

---

### **3. Error Handling Defensivo**

```typescript
async function getCurrentUserId(): Promise<string | null> {
  try {
    const token = await secure.getItem('auth_token');
    if (!token) return null; // ← Retorna null ao invés de lançar erro
    // ...
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null; // ← Falha silenciosa, não quebra o app
  }
}
```

**Validações em todas as funções:**
```typescript
export async function saveWorkoutPlans(plans: WorkoutPlan[]): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Usuário não autenticado'); // ← Erro explícito
  }
  // ...
}
```

---

### **4. Logging para Debug**

```typescript
console.log(`Saved ${plans.length} plans for user ${userId}`);
console.log(`Loaded ${plans.length} plans for user ${userId}`);
console.log(`Adding plan "${plan.name}" for user ${userId}`);
console.log(`No plans found for user ${userId}`);
```

**Benefícios:**
- Facilita debugging
- Permite rastrear operações por usuário
- Útil para TCC (demonstrar funcionamento)

---

## 🧪 Como Testar

### **Teste 1: Isolamento de Dados**

1. **Criar Usuário 1:**
   - Registrar com email: `user1@test.com`
   - Criar um treino "Plano A"
   - Verificar que o treino aparece na HomeScreen

2. **Fazer Logout**

3. **Criar Usuário 2:**
   - Registrar com email: `user2@test.com`
   - ✅ Verificar que NÃO aparece o "Plano A"
   - Criar um treino "Plano B"
   - ✅ Verificar que aparece apenas "Plano B"

4. **Fazer Logout e logar novamente como Usuário 1:**
   - ✅ Verificar que aparece apenas "Plano A"
   - ✅ "Plano B" NÃO deve estar visível

---

### **Teste 2: Verificação no Console**

Ao salvar um treino, você verá logs como:
```
Adding plan "Programa Upper/Lower" for user abc123
Loaded 0 plans for user abc123
Saved 1 plans for user abc123
Plan added successfully
```

---

### **Teste 3: Botão SALVANDO**

1. Criar um treino inteligente
2. Clicar em "ACEITAR TREINO"
3. ✅ Deve mostrar "SALVANDO..." brevemente
4. ✅ Deve navegar automaticamente para a HomeScreen
5. ✅ Botão não deve ficar travado
6. ✅ Ao voltar, o botão deve estar normal novamente

---

## 📖 Conceitos para o TCC

Esta implementação exemplifica:

### **1. Multi-tenancy em Aplicativos Mobile**
- Isolamento de dados por usuário
- Storage compartimentalizado
- Segurança e privacidade

### **2. Clean Architecture**
- Camada de Infraestrutura isolada
- Presentation Layer desacoplada
- Regras de negócio centralizadas

### **3. Segurança de Dados**
- Uso de SecureStore para dados sensíveis
- Validação de autenticação em todas as operações
- Não há vazamento de dados entre usuários

### **4. State Management**
- Controle de estados assíncronos (`isSaving`)
- Feedback visual para o usuário
- Error handling robusto

---

## 🚀 Migração Futura para Backend

Quando implementar o backend real, apenas o arquivo `workoutPlanStorage.ts` precisará ser modificado:

```typescript
// ❌ ATUAL: Storage local
export async function loadWorkoutPlans(): Promise<WorkoutPlan[]> {
  const userId = await getCurrentUserId();
  const storageKey = getUserStorageKey(userId);
  const json = await secure.getItem(storageKey);
  return JSON.parse(json);
}

// ✅ FUTURO: API Backend
export async function loadWorkoutPlans(): Promise<WorkoutPlan[]> {
  const token = await secure.getItem('auth_token');
  const response = await fetch('https://api.tcc-fitness.com/workout-plans', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
}
```

**Vantagens:**
- ✅ Nenhuma mudança nas Views
- ✅ Nenhuma mudança na lógica de apresentação
- ✅ Apenas o storage muda de local para remoto
- ✅ Clean Architecture facilitando a evolução do sistema

---

## 📚 Referências

- [Expo SecureStore Documentation](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [React Navigation - Reset](https://reactnavigation.org/docs/navigation-prop#reset)
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Multi-tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/multi-tenancy)

---

## ✅ Checklist de Implementação

- [x] Função `getCurrentUserId()` implementada
- [x] Função `getUserStorageKey()` implementada
- [x] `saveWorkoutPlans()` usando userId
- [x] `loadWorkoutPlans()` usando userId
- [x] `addWorkoutPlan()` usando userId
- [x] `removeWorkoutPlan()` usando userId
- [x] `clearWorkoutPlans()` usando userId
- [x] Correção do estado `isSaving`
- [x] Logs de debug implementados
- [x] Error handling em todas as funções
- [x] Testes manuais realizados
- [x] Documentação completa

---

**Status:** ✅ **IMPLEMENTADO E FUNCIONAL**

**Data:** Outubro 2025  
**Desenvolvedor:** João Marcos Ribeirete  
**Projeto:** TCC Fitness App - PUC-SP

