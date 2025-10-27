import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppHeader } from '../components/layout/AppHeader';
import RejectModal from '../components/ui/RejectModal';
import { profileStyles } from '../styles/profileStyles';
import { WorkoutHistoryService } from '../../infra/workoutHistoryService';
import type { WorkoutRecord } from '../../infra/workoutHistoryService';
import UserService from '../../infra/userService';
import * as secure from '../../infra/secureStore';
import { formatVolume, formatTime } from '../../utils/formatters';

const ProfileScreen = ({ navigation }: any) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [tempUserName, setTempUserName] = useState('');
  const [tempUserEmail, setTempUserEmail] = useState('');
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Carregar dados do usuário e histórico de treinos
  const loadUserData = useCallback(async () => {
    try {
      console.log('📋 Carregando dados do usuário e treinos...');
      
      // Carregar dados do usuário atual
      const currentUser = await UserService.getCurrentUser();
      if (currentUser) {
        setUserName(currentUser.username);
        setUserEmail(currentUser.email);
        
        console.log('✅ Usuário carregado:', currentUser.username, 'ID:', currentUser.id);
        
        // Carregar treinos do usuário atual com o novo serviço
        const workoutHistory = await WorkoutHistoryService.getWorkouts(currentUser.id);
        setWorkouts(workoutHistory);
        
        console.log('✅ Treinos carregados:', workoutHistory.length);
        if (workoutHistory.length > 0) {
          console.log('📊 Primeiro treino:', {
            id: workoutHistory[0].id,
            name: workoutHistory[0].name,
            exercisesCount: workoutHistory[0].exercises?.length,
            date: workoutHistory[0].date
          });
        }
      } else {
        console.log('❌ Usuário não encontrado');
        // Redirecionar para login se não há usuário
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados. Tente novamente.');
    }
  }, [navigation]);

  // Carregar dados
  const loadAllData = useCallback(async () => {
    setLoading(true);
    await loadUserData();
    setLoading(false);
  }, [loadUserData]);

  // Refresh manual
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [loadAllData]);

  // Carregar dados quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [loadAllData])
  );

  // Handlers
  const handleSettings = () => {
    setShowLogoutModal(true);
  };

  const handleLogout = async () => {
    try {
      // Limpar dados do usuário
      await UserService.clearUserData();
      
      // Limpar token de autenticação
      await secure.deleteItem('auth_token');
      console.log('Token removido do SecureStore');
      setShowLogoutModal(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setShowLogoutModal(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  const handleEditProfile = () => {
    setTempUserName(userName);
    setTempUserEmail(userEmail);
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (savingProfile) return; // Prevenir múltiplos cliques
    
    setSavingProfile(true);
    try {
      // Validação do username
      if (!tempUserName || tempUserName.trim().length === 0) {
        Alert.alert('Erro', 'Nome de usuário é obrigatório');
        return;
      } else if (tempUserName.trim().length < 3) {
        Alert.alert('Erro', 'Nome de usuário deve ter no mínimo 3 caracteres');
        return;
      } else if (tempUserName.trim().length > 10) {
        Alert.alert('Erro', 'Nome de usuário deve ter no máximo 10 caracteres');
        return;
      } else if (!/^[a-zA-Z0-9_]+$/.test(tempUserName)) {
        Alert.alert('Erro', 'Use apenas letras, números e underscore');
        return;
      }

      // Validação do email
      if (!tempUserEmail || tempUserEmail.trim().length === 0) {
        Alert.alert('Erro', 'Email é obrigatório');
        return;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempUserEmail)) {
        Alert.alert('Erro', 'Email inválido');
        return;
      }

      await UserService.updateUserData({
        username: tempUserName,
        email: tempUserEmail
      });
      
      setUserName(tempUserName);
      setUserEmail(tempUserEmail);
      setShowEditModal(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil. Tente novamente.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setTempUserName(userName);
    setTempUserEmail(userEmail);
    setShowEditModal(false);
  };

  const handleViewWorkout = (workout: WorkoutRecord) => {
    navigation.navigate('WorkoutDetails', { workout });
  };

  const handleAvatarPress = () => {
    Alert.alert('Alterar Foto', 'Funcionalidade em desenvolvimento');
  };

  // Funções de formatação
  const getInitials = (name: string): string => {
    if (!name || typeof name !== 'string') {
      return 'U'; // Default para usuário
    }
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) {
      return 'Data não disponível';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Funções de formatação agora importadas de utils/formatters.ts

  // Função para obter o ícone do grupo muscular
  const getMuscleGroupIcon = (muscleName: string) => {
    const normalized = muscleName.toLowerCase().trim();
    
    if (normalized.includes('peito') || normalized.includes('chest')) {
      return require('../../../assets/peito.png');
    } else if (normalized.includes('ombro') || normalized.includes('shoulder')) {
      return require('../../../assets/ombro.png');
    } else if (normalized.includes('perna') || normalized.includes('leg') || normalized.includes('panturrilha')) {
      return require('../../../assets/perna.png');
    } else if (normalized.includes('músculo') || normalized.includes('muscle')) {
      return require('../../../assets/musculo.png');
    } else {
      // Ícone padrão para outros grupos
      return require('../../../assets/parte-do-corpo.png');
    }
  };

  // Renderizar card de treino (estilo Hevy)
  const renderWorkoutCard = (workout: WorkoutRecord, index: number) => {
    if (!workout || !workout.id) {
      return null;
    }
    
    return (
    <View style={[profileStyles.workoutCard, { marginBottom: 16 }]}>
      <View style={profileStyles.workoutHeader}>
        <View style={profileStyles.workoutUserInfo}>
          <View style={profileStyles.workoutAvatar}>
            <Text style={profileStyles.workoutAvatarText}>{getInitials(userName)}</Text>
          </View>
          <View style={profileStyles.workoutUserDetails}>
            <Text style={profileStyles.workoutUserName}>{userName}</Text>
            <Text style={profileStyles.workoutDate}>{formatDate(workout.date)}</Text>
          </View>
        </View>
      </View>

      <Text style={profileStyles.workoutTitle}>
        {workout.name || 'Treino'}
        {workout.dayName && typeof workout.dayName === 'string' && workout.dayName.trim().length > 0 && (
          <> • {workout.dayName}</>
        )}
      </Text>

      {workout.notes && typeof workout.notes === 'string' && workout.notes.trim().length > 0 && (
        <Text style={profileStyles.workoutDescription}>{workout.notes}</Text>
      )}

      <View style={profileStyles.workoutStats}>
        <View style={[profileStyles.workoutStat, { marginRight: 24 }]}>
          <Image 
            source={require('../../../assets/relogio.png')} 
            style={{ width: 16, height: 16, marginRight: 8 }}
            resizeMode="contain"
          />
          <Text style={profileStyles.workoutStatText}>{formatTime(workout.duration || 0)}</Text>
        </View>
        <View style={profileStyles.workoutStat}>
          <Image 
            source={require('../../../assets/volume.png')} 
            style={{ width: 16, height: 16, marginRight: 8 }}
            resizeMode="contain"
          />
          <Text style={profileStyles.workoutStatText}>{formatVolume(workout.totalVolume || 0)} kg</Text>
        </View>
      </View>

      {/* Grupos Musculares */}
      {workout.muscleGroups && Array.isArray(workout.muscleGroups) && workout.muscleGroups.length > 0 && (
        <View style={profileStyles.workoutMuscles}>
          {workout.muscleGroups
            .filter((m): m is string => Boolean(m) && typeof m === 'string' && m.trim().length > 0)
            .slice(0, 3)
            .map((muscle, idx) => {
              const count = workout.exercises?.filter(ex => ex && ex.bodyPart === muscle).length || 0;
              
              return (
                <View key={`mg-${idx}`} style={profileStyles.muscleItem}>
                  <Image 
                    source={getMuscleGroupIcon(muscle)} 
                    style={profileStyles.muscleIcon}
                    resizeMode="contain"
                  />
                  <View style={profileStyles.muscleInfo}>
                    <Text style={profileStyles.muscleName}>{muscle}</Text>
                    <Text style={profileStyles.muscleCount}>
                      {count} exercício{count !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              );
            })}
        </View>
      )}

      <TouchableOpacity 
        style={profileStyles.viewWorkoutButton}
        onPress={() => handleViewWorkout(workout)}
        activeOpacity={0.8}
      >
        <Text style={profileStyles.viewWorkoutText}>Ver treino completo →</Text>
      </TouchableOpacity>
    </View>
    );
  };

  // Renderizar estado vazio
  const renderEmptyState = () => (
    <View style={profileStyles.emptyState}>
      <Text style={profileStyles.emptyTitle}>Nenhum treino encontrado</Text>
      <Text style={profileStyles.emptyMessage}>
        Complete alguns treinos para ver seu histórico aqui.
      </Text>
    </View>
  );

  // Renderizar loading
  const renderLoading = () => (
    <View style={profileStyles.loadingContainer}>
      <ActivityIndicator size="large" color="#ffffff" />
      <Text style={profileStyles.loadingText}>Carregando perfil...</Text>
    </View>
  );

  return (
    <View style={profileStyles.container}>
      <AppHeader 
        title="WEIGHT"
        onSettingsPress={handleSettings}
      />

      <RejectModal
        visible={showLogoutModal}
        title="Sair da conta"
        message="Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente."
        confirmText="Sim, sair"
        cancelText="Cancelar"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Modal de Editar Perfil */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelEdit}
      >
        <KeyboardAvoidingView 
          style={profileStyles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={profileStyles.modalContainer}>
            <View style={profileStyles.modalContent}>
              <Text style={profileStyles.modalTitle}>Editar Perfil</Text>

              <View style={profileStyles.inputGroup}>
                <Text style={profileStyles.inputLabel}>Nome de usuário</Text>
                <TextInput
                  style={profileStyles.textInput}
                  value={tempUserName}
                  onChangeText={setTempUserName}
                  placeholder="Digite seu nome de usuário"
                  placeholderTextColor="#888888"
                  maxLength={10}
                />
              </View>

              <View style={profileStyles.inputGroup}>
                <Text style={profileStyles.inputLabel}>Email</Text>
                <TextInput
                  style={profileStyles.textInput}
                  value={tempUserEmail}
                  onChangeText={setTempUserEmail}
                  placeholder="Digite seu email"
                  placeholderTextColor="#888888"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={profileStyles.modalButtons}>
                <TouchableOpacity
                  style={profileStyles.cancelButton}
                  onPress={handleCancelEdit}
                  activeOpacity={0.8}
                >
                  <Text style={profileStyles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[profileStyles.saveButton, savingProfile && { opacity: 0.6 }]}
                  onPress={handleSaveProfile}
                  activeOpacity={0.8}
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={profileStyles.saveButtonText}>Salvar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {loading ? (
        renderLoading()
      ) : (
        <ScrollView 
          style={profileStyles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#ffffff"
            />
          }
        >
          {/* Header do Perfil - Estilo Hevy */}
          <View style={profileStyles.profileHeader}>
            <TouchableOpacity 
              style={profileStyles.profileAvatar}
              onPress={handleAvatarPress}
              activeOpacity={0.8}
            >
              <Text style={profileStyles.avatarText}>{getInitials(userName)}</Text>
            </TouchableOpacity>

            <View style={profileStyles.profileInfo}>
              <Text style={profileStyles.profileName}>{userName}</Text>
              <TouchableOpacity 
                style={profileStyles.editProfileButton}
                onPress={handleEditProfile}
                activeOpacity={0.8}
              >
                <Text style={profileStyles.editProfileText}>Editar Perfil</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Estatísticas Simples */}
          <View style={profileStyles.statsSection}>
            <View style={profileStyles.statsRow}>
              <Text style={profileStyles.statNumber}>{workouts.length}</Text>
              <Text style={profileStyles.statLabel}>Treinamentos</Text>
            </View>
          </View>

          {/* Histórico de Treinos */}
          {workouts.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={profileStyles.workoutsList}>
              {workouts
                .filter(workout => workout && workout.id)
                .map((workout, index) => {
                  const card = renderWorkoutCard(workout, index);
                  return card ? <View key={workout.id}>{card}</View> : null;
                })}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default ProfileScreen;