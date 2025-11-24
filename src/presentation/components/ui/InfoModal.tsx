import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors } from '../../styles/colors';

interface InfoModalProps {
  visible: boolean;
  title: string;
  message?: string;
  highlights?: string[];
  confirmText?: string;
  onConfirm: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({
  visible,
  title,
  message,
  highlights,
  confirmText = 'Entendi, continuar',
  onConfirm,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      scaleAnim.setValue(0.9);
      contentOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 140,
          friction: 14,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(() => setModalVisible(false));
    }
  }, [visible, contentOpacity, scaleAnim]);

  const handleConfirm = useCallback(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      onConfirm();
    });
  }, [onConfirm, contentOpacity, scaleAnim]);

  if (!modalVisible) {
    return null;
  }

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>        
        <Animated.View
          style={[
            styles.container,
            {
              opacity: contentOpacity,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >        
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}

          {highlights && highlights.length > 0 && (
            <View style={styles.listContainer}>
              {highlights.map((item, index) => (
                <View key={`${item}-${index}`} style={styles.listItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} activeOpacity={0.85}>
            <Text style={styles.confirmText}>{confirmText}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 18,
  },
  listContainer: {
    marginBottom: 24,
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 6,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: colors.secondary,
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.buttonText,
  },
});

export default InfoModal;
