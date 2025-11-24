# Estrutura de Treinos - Weight App

## 📋 Visão Geral

Este documento descreve a estrutura de treinos implementada no aplicativo Weight, incluindo como os dados são organizados e como integrar com a API ExerciseDB no futuro.

## 🏗️ Arquitetura

### Arquivos Criados

1. **`src/domain/entities/Workout.ts`**
   - Define as interfaces TypeScript para exercícios e rotinas
   - `Exercise`: representa um exercício individual
   - `WorkoutRoutine`: representa uma rotina completa de treino
   - `RoutineType`: tipos de rotinas disponíveis

2. **`src/domain/entities/WorkoutPlan.ts`**
   - Define interfaces para planos de treino (semana completa)
   - `WorkoutPlanDay`: representa um dia de treino
   - `WorkoutPlan`: plano completo com múltiplos dias
   - Funções para gerar planos mock (Upper/Lower, Push/Pull/Legs)

3. **`src/data/mockWorkouts.ts`**
   - Contém dados simulados de treinos
   - 6 rotinas pré-definidas: Upper, Lower, Push, Pull, Legs, Full Body
   - Cada rotina tem 6 exercícios completos com séries, reps e descanso

4. **`src/presentation/workout/WorkoutPlanScreen.tsx`**
   - Tela de visualização do plano de treino gerado
   - Mostra a lista de dias/rotinas (Upper 1, Lower 1, etc.)
   - Botões: Aceitar, Recusar, Pedir Alterações
   - Ao clicar em um dia, navega para os exercícios

5. **`src/presentation/workout/WorkoutDetailScreen.tsx`**
   - Tela de visualização detalhada de um treino específico
   - Mostra todos os exercícios da rotina
   - Informações: nome, alvo muscular, equipamento, séries, reps, descanso

6. **`src/presentation/styles/workoutPlanStyles.ts`**
   - Estilos específicos para a tela de plano de treino

7. **`src/presentation/styles/workoutDetailStyles.ts`**
   - Estilos específicos para a tela de detalhes do treino

8. **`src/services/exerciseDB.ts`**
   - Funções para integração com a API ExerciseDB
   - Documentação de como usar a API
   - Exemplos de requisições

## 🎯 Rotinas Disponíveis

### 1. **Upper Body** (`upper`)
- Treino de membros superiores completo
- Foco: Peito, Costas, Ombros, Braços
- 6 exercícios, 60-75 min

### 2. **Lower Body** (`lower`)
- Treino de membros inferiores completo
- Foco: Quadríceps, Posterior, Panturrilha
- 6 exercícios, 60-75 min

### 3. **Push** (`push`)
- Treino de empurrar
- Foco: Peito, Ombros, Tríceps
- 6 exercícios, 60-75 min

### 4. **Pull** (`pull`)
- Treino de puxar
- Foco: Costas, Bíceps
- 6 exercícios, 60-75 min

### 5. **Legs** (`legs`)
- Treino intenso de pernas
- Foco: Pernas completas
- 6 exercícios, 75-90 min

### 6. **Full Body** (`fullbody`)
- Treino de corpo inteiro
- Foco: Todos os grupos musculares
- 6 exercícios, 60-75 min

## 🔄 Como Funciona a Navegação

### Fluxo 1: Treino Inteligente (IA)
```
IntelligentWorkoutScreen → WorkoutPlanScreen → WorkoutDetailScreen
```

1. Usuário preenche o formulário de treino inteligente
2. Após submeter, vai para `WorkoutPlanScreen` com o plano gerado
3. Vê as rotinas (Upper 1, Lower 1, etc.) com botões Aceitar/Recusar/Alterar
4. Ao clicar em uma rotina, vai para `WorkoutDetailScreen` ver os exercícios

### Fluxo 2: Rotinas Pré-definidas (HomeScreen)
```
HomeScreen → WorkoutDetailScreen (com routineType)
```

1. Usuário clica em um card de rotina (Upper, Lower, Push, Pull, Legs, Full Body)
2. Vai direto para `WorkoutDetailScreen` ver os exercícios

### Código de Navegação

**IntelligentWorkoutScreen:**
```typescript
const { generateMockWorkoutPlan } = require('../../domain/entities/WorkoutPlan');
const workoutPlan = generateMockWorkoutPlan();
navigation.navigate('WorkoutPlan', { workoutPlan });
```

**WorkoutPlanScreen:**
```typescript
const handleDayPress = (dayId, routineType, dayName) => {
  navigation.navigate('WorkoutDetail', { 
    routineType,
    dayName,
    planId: workoutPlan.id 
  });
};
```

**HomeScreen:**
```typescript
const handleRoutinePress = (routineType: RoutineType) => {
  navigation.navigate('WorkoutDetail', { routineType });
};
```

## 🌐 Integração com ExerciseDB

### Passo 1: Configurar API Key

1. Crie uma conta em [RapidAPI](https://rapidapi.com/)
2. Inscreva-se na [API ExerciseDB](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb)
3. Copie sua chave API
4. Adicione em `src/services/exerciseDB.ts`:

```typescript
const RAPIDAPI_KEY = 'SUA_CHAVE_API_AQUI';
```

### Passo 2: Substituir Dados Mock por Dados Reais

Exemplo de como buscar exercícios para uma rotina Upper:

```typescript
import { getExercisesByTarget } from '../../services/exerciseDB';

const fetchUpperWorkout = async () => {
  try {
    const chestExercises = await getExercisesByTarget('pectorals');
    const backExercises = await getExercisesByTarget('lats');
    const shoulderExercises = await getExercisesByTarget('delts');
    
    // Combinar e formatar exercícios
    const exercises = [
      ...chestExercises.slice(0, 2),
      ...backExercises.slice(0, 2),
      ...shoulderExercises.slice(0, 2)
    ].map((ex, index) => ({
      id: ex.id,
      name: ex.name,
      bodyPart: ex.bodyPart,
      target: ex.target,
      equipment: ex.equipment,
      gifUrl: ex.gifUrl,
      sets: 4,
      reps: '10-12',
      rest: '60s',
    }));
    
    return exercises;
  } catch (error) {
    console.error('Error fetching workout:', error);
    // Fallback para dados mock
    return mockWorkouts.upper.exercises;
  }
};
```

### Passo 3: Criar um Hook Personalizado

```typescript
// src/hooks/useWorkout.ts
import { useState, useEffect } from 'react';
import { RoutineType } from '../domain/entities/Workout';
import { mockWorkouts } from '../data/mockWorkouts';
import { getExercisesByTarget } from '../services/exerciseDB';

export const useWorkout = (routineType: RoutineType) => {
  const [workout, setWorkout] = useState(mockWorkouts[routineType]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Aqui você pode implementar a lógica para buscar da API
    // Por enquanto, usa os dados mock
    setWorkout(mockWorkouts[routineType]);
  }, [routineType]);

  return { workout, loading, error };
};
```

## 📊 Estrutura de Dados

### Exercise Interface
```typescript
interface Exercise {
  id: string;              // ID único do exercício
  name: string;            // Nome do exercício
  bodyPart: string;        // Parte do corpo (ex: "Peito", "Costas")
  target: string;          // Músculo alvo específico
  equipment: string;       // Equipamento necessário
  gifUrl?: string;         // URL da animação do exercício
  sets?: number;           // Número de séries
  reps?: string;           // Número de repetições
  rest?: string;           // Tempo de descanso
}
```

### WorkoutRoutine Interface
```typescript
interface WorkoutRoutine {
  id: string;              // ID único da rotina
  name: string;            // Nome da rotina
  description: string;     // Descrição breve
  exercises: Exercise[];   // Lista de exercícios
  duration: string;        // Duração estimada
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
}
```

## 🎨 Customização Visual

Os cards de rotina na HomeScreen têm bordas coloridas para identificação visual:

- **Upper Body**: Vermelho (#FF6B6B)
- **Lower Body**: Turquesa (#4ECDC4)
- **Push**: Amarelo (#FFD93D)
- **Pull**: Verde Água (#95E1D3)
- **Legs**: Rosa (#F38181)
- **Full Body**: Roxo (#AA96DA)

## 🚀 Próximos Passos

1. [ ] Adicionar API key do ExerciseDB
2. [ ] Implementar busca real de exercícios
3. [ ] Adicionar cache de exercícios
4. [ ] Implementar tela de execução de treino
5. [ ] Adicionar histórico de treinos
6. [ ] Adicionar progressão de cargas
7. [ ] Implementar timer de descanso
8. [ ] Adicionar vídeos/GIFs dos exercícios

## 📝 Notas

- Os dados atuais são simulados (mock data)
- A API do ExerciseDB é gratuita até 1000 requisições/dia
- As animações GIF dos exercícios estão disponíveis na API
- Todos os exercícios têm instruções passo a passo
- A API retorna exercícios em inglês (pode necessitar tradução)

## 🔗 Links Úteis

- [ExerciseDB API Documentation](https://edb-docs.up.railway.app/)
- [RapidAPI ExerciseDB](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb)
- [Lista completa de targets disponíveis](https://edb-docs.up.railway.app/docs/exercise-service/targets)
- [Lista completa de body parts](https://edb-docs.up.railway.app/docs/exercise-service/body-parts)
- [Lista completa de equipamentos](https://edb-docs.up.railway.app/docs/exercise-service/equipments)

