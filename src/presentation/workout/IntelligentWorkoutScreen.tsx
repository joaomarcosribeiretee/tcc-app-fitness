import React, { useState, useCallback, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import RejectModal from '../components/ui/RejectModal';
import LoadingModal from '../components/ui/LoadingModal';
import { intelligentWorkoutStyles } from '../styles/intelligentWorkoutStyles';
import * as secure from '../../infra/secureStore';
import userService from '../../infra/userService';
import { generateWorkoutPlanFromIA, AnamnesePayload } from '../../services/workoutPlanService';

// Habilitar animações de layout no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Interfaces para tipagem
interface FormData {
  idade: string;
  sexo: string;
  peso: string;
  experiencia: string;
  tempoTreino: string;
  diasSemana: string;
  tempoPorTreino: string;
  objetivos: string[];
  objetivosEspecificos: string;
  lesoes: string;
  condicoesMedicas: string;
  exerciciosNaoGosta: string;
  equipamentosExtras: string;
}


interface SelectorProps {
  field: keyof FormData;
  options: string[];
  multiple?: boolean;
  placeholder: string;
}

const IntelligentWorkoutScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState<FormData>({
    idade: '',
    sexo: '',
    peso: '',
    experiencia: '',
    tempoTreino: '',
    diasSemana: '',
    tempoPorTreino: '',
    objetivos: [],
    objetivosEspecificos: '',
    lesoes: '',
    condicoesMedicas: '',
    exerciciosNaoGosta: '',
    equipamentosExtras: ''
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [openSelector, setOpenSelector] = useState<keyof FormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Otimização: useCallback para evitar re-renders desnecessários
  const handleSettings = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
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
  }, [navigation]);

  const handleInputChange = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Validação para campos numéricos
  const handleNumericChange = useCallback((field: 'idade' | 'peso', value: string) => {
    // Remove tudo que não for número ou ponto decimal
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Para peso, permite um ponto decimal
    if (field === 'peso') {
      const parts = numericValue.split('.');
      if (parts.length > 2) {
        return; // Não permite mais de um ponto
      }
      handleInputChange(field, numericValue);
    } else {
      // Para idade, apenas números inteiros
      const integerValue = numericValue.replace(/\./g, '');
      handleInputChange(field, integerValue);
    }
  }, [handleInputChange]);

  const toggleSelector = useCallback((field: keyof FormData) => {
    // Animação suave ao abrir/fechar
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSelector(prev => prev === field ? null : field);
  }, []);

  const closeSelector = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSelector(null);
  }, []);

  const handleMultipleSelect = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => {
      const currentValues = prev[field] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];
      return {
        ...prev,
        [field]: newValues
      };
    });
  }, []);

  const handleOptionSelect = useCallback((field: keyof FormData, value: string, multiple: boolean) => {
    if (multiple) {
      handleMultipleSelect(field, value);
    } else {
      handleInputChange(field, value);
      closeSelector();
    }
  }, [handleMultipleSelect, handleInputChange, closeSelector]);

  // Opções memoizadas para melhor performance
  const sexoOptions = useMemo(() => ['Masculino', 'Feminino'], []);
  const experienciaOptions = useMemo(() => ['Iniciante', 'Intermediário', 'Avançado', 'Expert'], []);
  const tempoTreinoOptions = useMemo(() => [
    'Menos de 6 meses',
    '6 meses - 1 ano',
    '1 - 2 anos',
    '2 - 5 anos',
    '+ de 5 anos'
  ], []);
  const diasSemanaOptions = useMemo(() => ['1 dia', '2 dias', '3 dias', '4 dias', '5 dias', '6 dias'], []);
  const tempoPorTreinoOptions = useMemo(() => [
    '30 minutos a 1 hora',
    '1 hora a 1 hora e 30 minutos',
    '1 hora e 30 minutos a 2 horas',
    'Mais de 2 horas'
  ], []);
  const objetivosOptions = useMemo(() => [
    'Ganhar massa muscular',
    'Perder peso',
    'Definir o corpo',
    'Melhorar condicionamento físico',
    'Aumentar força',
    'Melhorar flexibilidade'
  ], []);

  const buildPayload = useCallback(async (): Promise<AnamnesePayload> => {
    const userId = await userService.getCurrentUserId();
    if (!userId) {
      throw new Error('Não foi possível identificar o usuário logado. Faça login novamente.');
    }

    const objetivosExtras = formData.objetivosEspecificos?.trim();
    const equipamentosExtras = formData.equipamentosExtras?.trim();

    return {
      usuario_id: Number(userId),
      idade: Number(formData.idade) || 0,
      sexo: formData.sexo || 'não informado',
      peso: Number(formData.peso) || 0,
      experiencia: formData.experiencia || 'iniciante',
      tempo_treino: formData.tempoTreino || 'não informado',
      dias_semana: formData.diasSemana || 'não informado',
      tempo_treino_por_dia: formData.tempoPorTreino || 'não informado',
      objetivos: formData.objetivos,
      objetivo_especifico: objetivosExtras || 'personalizado',
      lesao: formData.lesoes || 'nenhuma',
      condicao_medica: formData.condicoesMedicas || 'nenhuma',
      exercicio_nao_gosta: formData.exerciciosNaoGosta || 'nenhum',
      equipamentos: equipamentosExtras || undefined,
    };
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    try {
      const payload = await buildPayload();
      const { workoutPlan } = await generateWorkoutPlanFromIA(payload);
      setIsLoading(false);
      navigation.navigate('WorkoutPlan', { workoutPlan });
    } catch (error) {
      setIsLoading(false);
      const message = error instanceof Error ? error.message : 'Erro desconhecido ao gerar treino';
      Alert.alert('Erro ao gerar treino', message);
    }
  }, [buildPayload, navigation]);

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Animação de fade in ao carregar a tela
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Componente de Seletor Memoizado para evitar piscadas
  const Selector = React.memo(({ field, options, multiple = false, placeholder }: SelectorProps) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const scrollPositionRef = useRef(0);

    // Memoizar o valor do campo para evitar re-renders
    const fieldValue = useMemo(() => formData[field], [formData, field]);
    
    // Memoizar o texto de exibição
    const displayText = useMemo(() => {
      if (multiple) {
        const values = fieldValue as string[];
        if (values.length === 0) return placeholder;
        if (values.length === 1) return values[0];
        return `${values.length} selecionado(s)`;
      } else {
        const value = fieldValue as string;
        return value || placeholder;
      }
    }, [fieldValue, multiple, placeholder]);

    const isOpen = openSelector === field;

    // Calcular altura dinâmica do dropdown baseado no número de opções
    const dropdownHeight = useMemo(() => {
      const itemHeight = 49; // Altura de cada item (padding 14px x 2 + borderBottom 1px)
      const maxItems = 5; // Máximo de itens visíveis antes de scroll
      const extraPadding = 2; // Padding extra para não cortar
      const maxHeight = itemHeight * maxItems + extraPadding;
      const calculatedHeight = options.length * itemHeight + extraPadding;
      return Math.min(calculatedHeight, maxHeight);
    }, [options.length]);

    // Verificar se precisa de scroll (mais de 5 itens)
    const needsScroll = useMemo(() => options.length > 5, [options.length]);

    // Salvar posição do scroll ao tocar em opção
    const handleScroll = useCallback((event: any) => {
      scrollPositionRef.current = event.nativeEvent.contentOffset.y;
    }, []);

    // Handler otimizado para seleção de opção
    const onOptionPress = useCallback((option: string) => {
      handleOptionSelect(field, option, multiple);
      
      // Manter posição do scroll em seletores múltiplos
      if (multiple && scrollViewRef.current) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: scrollPositionRef.current,
            animated: false
          });
        }, 0);
      }
    }, [field, multiple, handleOptionSelect]);

    // Memoizar se o texto é diferente do placeholder
    const isTextSelected = useMemo(() => displayText !== placeholder, [displayText, placeholder]);

    return (
      <View style={intelligentWorkoutStyles.selectorContainer}>
        <TouchableOpacity
          style={[
            intelligentWorkoutStyles.selector,
            isOpen && intelligentWorkoutStyles.selectorOpen
          ]}
          onPress={() => toggleSelector(field)}
          activeOpacity={0.7}
        >
          <Text 
            style={[
              intelligentWorkoutStyles.selectorText,
              isTextSelected && intelligentWorkoutStyles.selectorTextSelected
            ]}
            numberOfLines={1}
          >
            {displayText}
          </Text>
          <Text style={intelligentWorkoutStyles.selectorArrow}>
            {isOpen ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {isOpen && (
          <ScrollView
            ref={scrollViewRef}
            style={[
              intelligentWorkoutStyles.dropdown,
              { height: dropdownHeight }
            ]}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
            scrollEnabled={needsScroll}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {options.map((option, index) => {
              const isSelected = multiple 
                ? (fieldValue as string[]).includes(option)
                : fieldValue === option;

              return (
                <TouchableOpacity
                  key={`${field}-${option}-${index}`}
                  style={[
                    intelligentWorkoutStyles.option,
                    isSelected && intelligentWorkoutStyles.optionSelected,
                    index === options.length - 1 && intelligentWorkoutStyles.lastOption
                  ]}
                  onPress={() => onOptionPress(option)}
                  activeOpacity={0.7}
                >
                  <Text 
                    style={[
                      intelligentWorkoutStyles.optionText,
                      isSelected && intelligentWorkoutStyles.optionTextSelected
                    ]}
                    numberOfLines={1}
                  >
                    {option}
                  </Text>
                  {multiple && isSelected && (
                    <Text style={intelligentWorkoutStyles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  }, (prevProps, nextProps) => {
    // Custom comparison para evitar re-renders desnecessários
    return (
      prevProps.field === nextProps.field &&
      prevProps.placeholder === nextProps.placeholder &&
      prevProps.multiple === nextProps.multiple &&
      prevProps.options.length === nextProps.options.length
    );
  });

  return (
    <View style={intelligentWorkoutStyles.container}>
      {/* Header */}
      <AppHeader
        title="WEIGHT"
        onSettingsPress={handleSettings}
      />

      {/* Modal de Logout */}
      <RejectModal
        visible={showLogoutModal}
        title="Sair da conta"
        message="Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente."
        confirmText="Sim, sair"
        cancelText="Cancelar"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Modal de Loading */}
      <LoadingModal
        visible={isLoading}
        title="Criando seu plano de treino personalizado..."
        subtitle="Isso pode levar alguns segundos"
      />

      <Animated.ScrollView 
        style={[intelligentWorkoutStyles.content, { opacity: fadeAnim }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Título */}
        <View style={intelligentWorkoutStyles.titleContainer}>
          <Text style={intelligentWorkoutStyles.title}>TREINO INTELIGENTE</Text>
          <View style={intelligentWorkoutStyles.titleUnderline} />
        </View>

        {/* Informações Básicas */}
        <View style={intelligentWorkoutStyles.section}>
          <Text style={intelligentWorkoutStyles.sectionTitle}>Informações Básicas</Text>
          
          <Text style={intelligentWorkoutStyles.questionLabel}>Qual sua idade?</Text>
          <TextInput
            style={intelligentWorkoutStyles.input}
            placeholder="Digite sua idade"
            placeholderTextColor="#999999"
            value={formData.idade}
            onChangeText={(value) => handleNumericChange('idade', value)}
            keyboardType="numeric"
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>Qual seu sexo?</Text>
          <Selector
            field="sexo"
            options={sexoOptions}
            placeholder="Selecione seu sexo"
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>Qual seu peso atual (kg)?</Text>
          <TextInput
            style={intelligentWorkoutStyles.input}
            placeholder="Digite seu peso"
            placeholderTextColor="#999999"
            value={formData.peso}
            onChangeText={(value) => handleNumericChange('peso', value)}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Nível de Experiência */}
        <View style={intelligentWorkoutStyles.section}>
          <Text style={intelligentWorkoutStyles.sectionTitle}>Nível de Experiência</Text>
          
          <Text style={intelligentWorkoutStyles.questionLabel}>
            Como você classificaria sua experiência com treinos?
          </Text>
          <Selector
            field="experiencia"
            options={experienciaOptions}
            placeholder="Selecione seu nível"
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>
            Há quanto tempo você treina com regularidade?
          </Text>
          <Selector
            field="tempoTreino"
            options={tempoTreinoOptions}
            placeholder="Selecione o tempo"
          />
        </View>

        {/* Frequência e Tempo Disponível */}
        <View style={intelligentWorkoutStyles.section}>
          <Text style={intelligentWorkoutStyles.sectionTitle}>Frequência e Tempo Disponível</Text>
          
          <Text style={intelligentWorkoutStyles.questionLabel}>
            Quantos dias por semana você tem e quer para treinar?
          </Text>
          <Selector
            field="diasSemana"
            options={diasSemanaOptions}
            placeholder="Selecione os dias"
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>
            Quanto tempo por treino você tem disponível?
          </Text>
          <Selector
            field="tempoPorTreino"
            options={tempoPorTreinoOptions}
            placeholder="Selecione o tempo"
          />
        </View>

        {/* Objetivos */}
        <View style={intelligentWorkoutStyles.section}>
          <Text style={intelligentWorkoutStyles.sectionTitle}>Objetivos</Text>
          
          <Text style={intelligentWorkoutStyles.questionLabel}>
            Quais são os seus objetivos com o treino? (Você pode selecionar mais de um)
          </Text>
          <Selector
            field="objetivos"
            options={objetivosOptions}
            multiple={true}
            placeholder="Selecione seus objetivos"
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>
            Tem algum objetivo específico? (opcional)
          </Text>
          <TextInput
            style={intelligentWorkoutStyles.textArea}
            placeholder="Ex: aumentar braços, fortalecer costas, melhorar postura, etc."
            placeholderTextColor="#999999"
            value={formData.objetivosEspecificos}
            onChangeText={(value) => handleInputChange('objetivosEspecificos', value)}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Restrições e Limitações */}
        <View style={intelligentWorkoutStyles.section}>
          <Text style={intelligentWorkoutStyles.sectionTitle}>Restrições e Limitações</Text>
          
          <Text style={intelligentWorkoutStyles.questionLabel}>
            Você possui alguma lesão ou limitação física?
          </Text>
          <TextInput
            style={intelligentWorkoutStyles.textArea}
            placeholder="Descreva suas lesões ou limitações (opcional)"
            placeholderTextColor="#999999"
            value={formData.lesoes}
            onChangeText={(value) => handleInputChange('lesoes', value)}
            multiline
            numberOfLines={3}
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>
            Você possui alguma condição médica que devemos considerar?
          </Text>
          <TextInput
            style={intelligentWorkoutStyles.textArea}
            placeholder="Descreva suas condições médicas (opcional)"
            placeholderTextColor="#999999"
            value={formData.condicoesMedicas}
            onChangeText={(value) => handleInputChange('condicoesMedicas', value)}
            multiline
            numberOfLines={3}
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>
            Existe algum exercício que não gosta ou não consegue realizar?
          </Text>
          <TextInput
            style={intelligentWorkoutStyles.textArea}
            placeholder="Liste os exercícios que não gosta (opcional)"
            placeholderTextColor="#999999"
            value={formData.exerciciosNaoGosta}
            onChangeText={(value) => handleInputChange('exerciciosNaoGosta', value)}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Equipamentos Disponíveis */}
        <View style={intelligentWorkoutStyles.section}>
          <Text style={intelligentWorkoutStyles.sectionTitle}>Equipamentos Disponíveis</Text>

          <Text style={intelligentWorkoutStyles.questionLabel}>
            Liste os equipamentos que você tem disponíveis (opcional)
          </Text>
          <TextInput
            style={intelligentWorkoutStyles.textArea}
            placeholder="Ex: Halteres, barra fixa, máquina de cabo..."
            placeholderTextColor="#999999"
            value={formData.equipamentosExtras}
            onChangeText={(value) => handleInputChange('equipamentosExtras', value)}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Botões */}
        <View style={intelligentWorkoutStyles.buttonContainer}>
          <TouchableOpacity
            style={intelligentWorkoutStyles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={intelligentWorkoutStyles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={intelligentWorkoutStyles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={intelligentWorkoutStyles.submitButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default IntelligentWorkoutScreen;
