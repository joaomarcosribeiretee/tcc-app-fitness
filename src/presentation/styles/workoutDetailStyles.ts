import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const workoutDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.secondary,
  },
  content: {
    flex: 1,
  },
  headerInfo: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
    backgroundColor: 'rgba(120, 127, 132, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    alignSelf: 'center',
  },
  routineName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  routineDescription: {
    fontSize: 16,
    color: colors.secondary,
    marginBottom: 12,
  },
  routineInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.secondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  exercisesList: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 16,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  exerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 6,
  },
  exerciseTarget: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 4,
  },
  exerciseEquipment: {
    fontSize: 12,
    color: colors.accent,
  },
  exerciseNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  exerciseNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.buttonText,
  },
  exerciseDetails: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  startButton: {
    backgroundColor: colors.success,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  startButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.accent,
    textAlign: 'center',
  },

  // Estilos para tela de detalhes do treino histórico
  workoutHeader: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  workoutDate: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 12,
  },
  workoutNotes: {
    fontSize: 16,
    color: colors.secondary,
    fontStyle: 'italic',
    lineHeight: 22,
  },

  // Estatísticas do treino
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.secondary,
    textAlign: 'center',
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
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },

  // Exercícios (histórico)
  historyExerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyExerciseHeader: {
    marginBottom: 12,
  },
  historyExerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  historyExerciseBodyPart: {
    fontSize: 14,
    color: colors.secondary,
  },
  historyExerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  historyExerciseStat: {
    alignItems: 'center',
  },
  historyExerciseStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 2,
    textAlign: 'center',
    maxWidth: 60,
  },
  historyExerciseStatLabel: {
    fontSize: 12,
    color: colors.secondary,
  },

  // Botões (histórico)
  historyButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#151F2B', // Mesma cor do header
    borderTopWidth: 1,
    borderTopColor: '#787F84', // Traço azul como no header
  },
  historyBackButton: {
    backgroundColor: '#151F2B', // Mesma cor do header
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#787F84', // Cor azul do header
    alignItems: 'center',
  },
  historyBackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#787F84', // Cor azul do header
  },
});

