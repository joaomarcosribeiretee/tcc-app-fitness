import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  // Header do perfil - Estilo Hevy
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editProfileButton: {
    backgroundColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editProfileText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '500',
  },
  workoutCount: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 80,
  },
  workoutCountNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 2,
  },
  workoutCountLabel: {
    fontSize: 10,
    color: colors.secondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Seção de estatísticas
  statsSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,

    borderWidth: 1,
    borderColor: colors.border,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.secondary,
  },

  // Lista de treinos
  workoutsList: {
    marginTop: 20,
  },

  // Card de treino - Estilo Hevy
  workoutCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  workoutHeader: {
    marginBottom: 16,
  },
  workoutUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workoutAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  workoutUserDetails: {
    flex: 1,
  },
  workoutUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  workoutDate: {
    fontSize: 12,
    color: colors.secondary,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  workoutDescription: {
    fontSize: 14,
    color: colors.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },

  // Estatísticas do treino
  workoutStats: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingRight: 24,
  },
  workoutStatsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutStatIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  workoutStatText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  // Músculos trabalhados
  workoutMuscles: {
    marginBottom: 16,
  },
  muscleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  muscleIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
    tintColor: colors.accent,
  },
  muscleInfo: {
    flex: 1,
  },
  muscleName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  muscleCount: {
    fontSize: 12,
    color: colors.secondary,
  },

  // Botão ver treino completo
  viewWorkoutButton: {
    alignSelf: 'flex-start',
  },
  viewWorkoutText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },

  // Estado vazio
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    color: colors.secondary,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: colors.secondary,
    marginTop: 12,
  },

  // Modal de Editar Perfil
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
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 50,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.secondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 50,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.background,
  },
});