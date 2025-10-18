import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { colors } from '../styles/colors';

const AcceptWorkoutScreen = ({ navigation }: any) => {
  const handleAccept = () => {
    // Por enquanto, voltar para home
    navigation.navigate('Home');
  };

  const handleReject = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="WEIGHT"
        onSettingsPress={() => {}}
      />
      
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>TREINO CRIADO</Text>
          <View style={styles.titleUnderline} />
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.message}>
            Seu treino personalizado foi criado com sucesso!
          </Text>
          <Text style={styles.subMessage}>
            Deseja aceitar este treino e começar sua jornada fitness?
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={handleReject}
          >
            <Text style={styles.rejectButtonText}>Recusar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleAccept}
          >
            <Text style={styles.acceptButtonText}>Aceitar Treino</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  titleUnderline: {
    width: '100%',
    height: 2,
    backgroundColor: colors.primary,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  message: {
    fontSize: 18,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  subMessage: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50', // Green for accept
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AcceptWorkoutScreen;
