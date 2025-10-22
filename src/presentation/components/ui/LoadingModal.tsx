import React, { useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  Animated, 
  Easing,
  StyleSheet
} from 'react-native';
import { colors } from '../../styles/colors';
import { fonts } from '../../styles/fonts';

interface LoadingModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
}

// Componente do Spinner de Loading
const LoadingSpinner = () => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const startRotation = useCallback(() => {
    spinValue.setValue(0);
    
    const rotateAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000, // 2 segundos por volta completa
        useNativeDriver: true,
        easing: Easing.linear,
      })
    );
    
    animationRef.current = rotateAnimation;
    rotateAnimation.start();
  }, [spinValue]);

  React.useEffect(() => {
    startRotation();

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      spinValue.setValue(0);
    };
  }, [startRotation, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.spinnerContainer}>
      <Animated.View 
        style={[
          styles.spinner,
          { transform: [{ rotate: spin }] }
        ]}
      />
    </View>
  );
};

const LoadingModal: React.FC<LoadingModalProps> = ({
  visible,
  title,
  subtitle
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingMainContainer}>
          {/* Spinner animado */}
          <LoadingSpinner />
          
          {/* Texto de carregamento */}
          <Text style={styles.loadingTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.loadingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMainContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    maxWidth: '90%',
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  spinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderColor: 'transparent',
    borderTopColor: '#bb86fc',
    borderRightColor: '#bb86fc',
    borderBottomColor: '#bb86fc',
  },
  loadingTitle: {
    color: colors.primary,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 22,
  },
  loadingSubtitle: {
    color: colors.secondary,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 20,
  },
});

export default LoadingModal;
