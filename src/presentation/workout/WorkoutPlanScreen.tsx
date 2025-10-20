import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { workoutPlanStyles } from '../styles/workoutPlanStyles';
import { WorkoutPlan } from '../../domain/entities/WorkoutPlan';
import { addWorkoutPlan } from '../../infra/workoutPlanStorage';

interface WorkoutPlanScreenProps {
  navigation: any;
  route: {
    params?: {
      workoutPlan?: WorkoutPlan;
      fromHome?: boolean;
    };
  };
}

const WorkoutPlanScreen = ({ navigation, route }: WorkoutPlanScreenProps) => {
  const workoutPlan = route.params?.workoutPlan;
  const fromHome = route.params?.fromHome || false;

  if (!workoutPlan) {
    return (
      <View style={workoutPlanStyles.container}>
        <AppHeader title="WEIGHT" onSettingsPress={() => {}} />
        <View style={workoutPlanStyles.emptyState}>
          <Text style={workoutPlanStyles.emptyText}>Plano não encontrado</Text>
          <Text style={workoutPlanStyles.emptySubtext}>
            Crie um treino inteligente para visualizar seu plano
          </Text>
        </View>
      </View>
    );
  }

  const handleAccept = async () => {
    console.log('===== HANDLE ACCEPT CALLED =====');
    
    if (!workoutPlan) {
      console.log('Workout plan is undefined');
      Alert.alert('Erro', 'Plano de treino não encontrado');
      return;
    }
    
    console.log('Attempting to save workout plan:', workoutPlan.name);
    console.log('Workout plan details:', JSON.stringify(workoutPlan, null, 2));
    
    try {
      await addWorkoutPlan(workoutPlan);
      console.log('Workout plan saved successfully');
      
      Alert.alert(
        'Treino Aceito!',
        'Seu plano de treino foi salvo com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('Navigating to Main');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error in handleAccept:', error);
      Alert.alert(
        'Erro', 
        `Não foi possível salvar o treino: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  };

  const handleReject = () => {
    Alert.alert(
      'Recusar Treino',
      'Tem certeza que deseja recusar este plano?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sim, recusar',
          style: 'destructive',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleRequestChanges = () => {
    Alert.alert(
      'Solicitar Alterações',
      'Funcionalidade será implementada em breve! Você poderá pedir ajustes específicos no seu treino.',
      [{ text: 'OK' }]
    );
  };

  const handleDayPress = (dayId: string, routineType: string, dayName: string) => {
    navigation.navigate('WorkoutDetail', { 
      routineType,
      dayName,
      planId: workoutPlan.id 
    });
  };

  return (
    <View style={workoutPlanStyles.container}>
      <AppHeader title="WEIGHT" onSettingsPress={() => {}} />
      
      <ScrollView style={workoutPlanStyles.content} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho do Plano */}
        <View style={workoutPlanStyles.header}>
          <Text style={workoutPlanStyles.badge}>TREINO CRIADO</Text>
          <Text style={workoutPlanStyles.planName}>{workoutPlan.name}</Text>
          <Text style={workoutPlanStyles.planDescription}>{workoutPlan.description}</Text>
        </View>

        {/* Lista de Dias */}
        <View style={workoutPlanStyles.daysSection}>
          <Text style={workoutPlanStyles.sectionTitle}>Rotina Semanal</Text>
          
          {workoutPlan.days.map((day, index) => (
            <TouchableOpacity
              key={day.id}
              style={workoutPlanStyles.dayCard}
              onPress={() => handleDayPress(day.id, day.routineType, day.name)}
              activeOpacity={0.7}
            >
              <View style={workoutPlanStyles.dayNumberBadge}>
                <Text style={workoutPlanStyles.dayNumberText}>{day.dayNumber}</Text>
              </View>
              
              <View style={workoutPlanStyles.dayInfo}>
                <Text style={workoutPlanStyles.dayName}>{day.name}</Text>
                <Text style={workoutPlanStyles.dayType}>
                  {day.routineType.toUpperCase()}
                </Text>
              </View>
              
              <Text style={workoutPlanStyles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info adicional */}
        <View style={workoutPlanStyles.infoBox}>
          <Text style={workoutPlanStyles.infoText}>
            Toque em cada dia para ver os exercícios detalhados
          </Text>
        </View>
      </ScrollView>

      {/* Botões de Ação - só mostra se não veio da Home */}
      {!fromHome && (
        <View style={workoutPlanStyles.buttonContainer}>
          <TouchableOpacity
            style={workoutPlanStyles.acceptButton}
            onPress={handleAccept}
          >
            <Text style={workoutPlanStyles.acceptButtonText}>✓ ACEITAR TREINO</Text>
          </TouchableOpacity>

          <View style={workoutPlanStyles.secondaryButtons}>
            <TouchableOpacity
              style={workoutPlanStyles.changesButton}
              onPress={handleRequestChanges}
            >
              <Text style={workoutPlanStyles.changesButtonText}>Pedir Alterações</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={workoutPlanStyles.rejectButton}
              onPress={handleReject}
            >
              <Text style={workoutPlanStyles.rejectButtonText}>Recusar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Botão Voltar - só mostra se veio da Home */}
      {fromHome && (
        <View style={workoutPlanStyles.buttonContainer}>
          <TouchableOpacity
            style={workoutPlanStyles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={workoutPlanStyles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default WorkoutPlanScreen;

