import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { fonts } from './fonts';

export const executionStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: colors.secondary,
    textAlign: 'center',
  },
  
  // Header do treino
  workoutHeader: {
    marginTop: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  dayBadge: {
    backgroundColor: colors.accent,
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  workoutDescription: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Container de exercícios
  exercisesContainer: {
    marginBottom: 20,
  },

  // Card do exercício
  exerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  exerciseTarget: {
    fontSize: 14,
    color: colors.secondary,
  },
  exerciseProgress: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },

  // Container de sets
  setsContainer: {
    marginTop: 8,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  setHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // Linha de set
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  setNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    width: 40,
    textAlign: 'center',
  },
  setInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.primary,
    textAlign: 'center',
    width: 80,
    marginHorizontal: 6,
  },
  setInputCompleted: {
    backgroundColor: colors.success + '20',
    borderColor: colors.success,
    color: colors.success,
  },
  completeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  completeButtonActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  completeButtonText: {
    fontSize: 18,
    color: colors.border,
    fontWeight: 'bold',
  },
  completeButtonTextActive: {
    color: colors.primary,
  },

  // Botões de ação
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  finishButton: {
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  finishButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
