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

  // Container de estatísticas (Timer e Volume)
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    alignItems: 'center',
  },
  statIcon: {
    width: 24,
    height: 24,
    marginBottom: 6,
  },
  statIconText: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.secondary,
    textAlign: 'center',
    fontWeight: '500',
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

  // Botão adicionar set
  addSetButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  addSetButtonText: {
    color: colors.buttonText,
    fontSize: 14,
    fontWeight: '600',
  },

  // Botões de ação
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: -10,
  },
  finishButton: {
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  finishButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  backButton: {
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  // ===== ESTILOS PARA TELA DE FINALIZAÇÃO =====
  
  // Header de finalização
  summaryHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.success,
    textAlign: 'center',
    marginBottom: 8,
  },
  summarySubtitle: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
  },

  // Seções
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },

  // Grupos musculares
  muscleGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleGroupTag: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  muscleGroupText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },

  // Resumo dos exercícios
  exerciseSummaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exerciseSummaryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    flex: 1,
  },
  exerciseSummaryBodyPart: {
    fontSize: 12,
    color: colors.secondary,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  exerciseSummaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  exerciseSummaryStat: {
    alignItems: 'center',
  },
  exerciseSummaryStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 2,
  },
  exerciseSummaryStatLabel: {
    fontSize: 12,
    color: colors.secondary,
  },

  // Input de notas
  notesInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.primary,
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Botão desabilitado
  finishButtonDisabled: {
    backgroundColor: colors.secondary + '50',
    opacity: 0.6,
  },

  // Modal de sucesso - Padrão do App
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    maxWidth: 340,
    minWidth: 280,
    width: '90%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkIcon: {
    fontSize: 32,
    color: colors.primary,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  modalButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
