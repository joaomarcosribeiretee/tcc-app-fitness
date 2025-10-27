# Como Implementar QuickWorkoutScreen

## Arquivos Já Criados ✅
1. `src/domain/entities/QuickWorkout.ts` - Estrutura de dados
2. `src/services/mockExercises.ts` - Lista de exercícios
3. `src/presentation/styles/quickWorkoutStyles.ts` - Estilos
4. `App.tsx` - Rota já configurada

## Arquivo Base
Use `src/presentation/workout/WorkoutExecutionScreen.tsx` como base.

## Diferenças Chave do QuickWorkout

### 1. Estado dos Exercícios (linha ~40)
Em vez de:
```typescript
const exercises = passedExercises || mockWorkout?.exercises || [];
```

Use:
```typescript
const [exercises, setExerc扱ises] = useState<Exercise[]>([]); // Array vazio inicial
```

### 2. Adicionar função para adicionar exercício (após handleSetChange)
```typescript
const handleAddExercise = (exercise: AvailableExercise) => {
  const newExercise = {
    ...exercise,
    id: `${exercise.id}-${Date.now()}`,
    sets: 0 // Sem sets pré-definidos
  };
  setExercises([...exercises, newExercise]);
};
```

### 3. Botão para adicionar exercício (antes da lista de exercícios)
```typescript
<TouchableOpacity 
  style={quickWorkoutStyles.addExerciseButton}
  onPress={() => setShowExerciseModal(true)}
>
  <Text style={quickWorkoutStyles.addExerciseButtonText}>+ Adicionar Exercício</Text>
</TouchableOpacity>
```

### 4. Modal para buscar exercícios (após RejectModal)
```typescript
// ... adicionar modal de busca aqui
```

## Resumo: Copie o arquivo WorkoutExecutionScreen, renomeie para QuickWorkoutScreen, e faça essas alterações.

