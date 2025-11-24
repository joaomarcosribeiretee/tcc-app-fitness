import React, { useState, useCallback, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import InfoModal from '../components/ui/InfoModal';
import RejectModal from '../components/ui/RejectModal';
import LoadingModal from '../components/ui/LoadingModal';
import { intelligentWorkoutStyles } from '../styles/intelligentWorkoutStyles';
import * as secure from '../../infra/secureStore';
import userService from '../../infra/userService';
import {
  DietAnamnesisPayload,
  generateDietPlanFromIA,
} from '../../services/dietPlanService';

// Habilitar animações de layout no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Interfaces para tipagem
interface FormData {
  sexo: string;
  idade: string;
  altura: string;
  pesoAtual: string;
  pesoObjetivo: string;
  objetivoDieta: string;
  dataMeta: string;
  rotinaAlimentacao: string;
  orcamentoMensal: string;
  priorizarAcessivel: string;
  comeFora: string;
  vezesForaSemana: string;
  tipoAlimentacao: string;
  tipoAlimentacaoOutra: string;
  alimentosGosta: string;
  alimentosNaoGosta: string;
  refeicoesPorDia: string;
  fazLanches: string;
  horariosRefeicoes: string;
  preparaRefeicoes: string;
  ondeCome: string;
  alergias: string;
  condicoesMedicas: string;
  suplementosMedicacao: string;
}

interface SelectorProps {
  field: keyof FormData;
  options: string[];
  multiple?: boolean;
  placeholder: string;
}

const IntelligentDietScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState<FormData>({
    sexo: '',
    idade: '',
    altura: '',
    pesoAtual: '',
    pesoObjetivo: '',
    objetivoDieta: '',
    dataMeta: '',
    rotinaAlimentacao: '',
    orcamentoMensal: '',
    priorizarAcessivel: '',
    comeFora: '',
    vezesForaSemana: '',
    tipoAlimentacao: '',
    tipoAlimentacaoOutra: '',
    alimentosGosta: '',
    alimentosNaoGosta: '',
    refeicoesPorDia: '',
    fazLanches: '',
    horariosRefeicoes: '',
    preparaRefeicoes: '',
    ondeCome: '',
    alergias: '',
    condicoesMedicas: '',
    suplementosMedicacao: ''
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [openSelector, setOpenSelector] = useState<keyof FormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    setFormData(prev => {
      const updated: FormData = {
        ...prev,
        [field]: value
      };

      if (field === 'comeFora' && value !== 'Sim') {
        updated.vezesForaSemana = '';
      }

      if (field === 'tipoAlimentacao' && value !== 'Outra') {
        updated.tipoAlimentacaoOutra = '';
      }

      return updated;
    });
  }, []);

  const handleNumericChange = useCallback((field: 'idade' | 'altura' | 'pesoAtual' | 'pesoObjetivo' | 'vezesForaSemana' | 'refeicoesPorDia', value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) return;
    handleInputChange(field, numericValue);
  }, [handleInputChange]);

  const toggleSelector = useCallback((field: keyof FormData) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSelector(prev => prev === field ? null : field);
  }, []);

  const closeSelector = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSelector(null);
  }, []);

  const handleOptionSelect = useCallback((field: keyof FormData, value: string) => {
    handleInputChange(field, value);
    closeSelector();
  }, [handleInputChange, closeSelector]);

  const sexoOptions = useMemo(() => ['Masculino', 'Feminino'], []);
  const objetivoDietaOptions = useMemo(() => [
    'Emagrecimento',
    'Ganho de massa muscular',
    'Manutenção do peso',
    'Definição corporal',
    'Reeducação alimentar'
  ], []);
  const rotinaAlimentacaoOptions = useMemo(() => [
    'Muito desregrada',
    'Razoavelmente equilibrada',
    'Bastante controlada'
  ], []);
  const orcamentoOptions = useMemo(() => [
    'Até R$300 (orçamento restrito)',
    'R$300 – R$600 (perfil econômico)',
    'R$600 – R$1.000 (faixa moderada)',
    'R$1.000 – R$1.500 (faixa confortável)',
    'Acima de R$1.500 (orçamento flexível)'
  ], []);
  const simNaoOptions = useMemo(() => ['Sim', 'Não'], []);
  const tipoAlimentacaoOptions = useMemo(() => [
    'Nenhuma',
    'Vegetariana',
    'Vegana',
    'Low Carb',
    'Cetogênica',
    'Mediterrânea',
    'Outra'
  ], []);
  const refeicoesPorDiaOptions = useMemo(() => ['1', '2', '3', '4', '5', '6'], []);
  const ondeComeOptions = useMemo(() => [
    'Em casa',
    'No trabalho/faculdade',
    'Fora (restaurantes, marmita, etc.)'
  ], []);

  const yesNoToBool = useCallback((value: string) => {
    return value?.trim().toLowerCase() === 'sim';
  }, []);

  const buildPayload = useCallback(async (): Promise<DietAnamnesisPayload> => {
    const userId = await userService.getCurrentUserId();
    if (!userId) {
      throw new Error('Não foi possível identificar o usuário logado. Faça login novamente.');
    }

    const alturaCm = Number(formData.altura);
    const alturaMetros = Number.isFinite(alturaCm) && alturaCm > 0 ? alturaCm / 100 : 0;

    const pesoAtual = Number(formData.pesoAtual);
    const pesoDesejado = Number(formData.pesoObjetivo);
    const idade = Number(formData.idade);
    const refeicoes = Number(formData.refeicoesPorDia);

    const tipoAlimentacao = formData.tipoAlimentacao === 'Outra'
      ? (formData.tipoAlimentacaoOutra?.trim() || 'Personalizada')
      : (formData.tipoAlimentacao || 'Nenhuma');

    return {
      usuario_id: Number(userId),
      sexo: formData.sexo || 'Não informado',
      idade: Number.isFinite(idade) ? idade : 0,
      altura: Number.isFinite(alturaMetros) ? Number(alturaMetros.toFixed(2)) : 0,
      pesoatual: Number.isFinite(pesoAtual) ? pesoAtual : 0,
      pesodesejado: Number.isFinite(pesoDesejado) ? pesoDesejado : 0,
      objetivo: formData.objetivoDieta || 'Personalizado',
      data_meta: formData.dataMeta?.trim() || 'Sem meta definida',
      avalicao_rotina: formData.rotinaAlimentacao || 'Não informado',
      orcamento: formData.orcamentoMensal || 'Não informado',
      alimentos_acessiveis: yesNoToBool(formData.priorizarAcessivel),
      come_fora: yesNoToBool(formData.comeFora),
      tipo_alimentacao: tipoAlimentacao,
      alimentos_gosta: formData.alimentosGosta?.trim() || 'Não informado',
      alimentos_nao_gosta: formData.alimentosNaoGosta?.trim() || 'Nenhum',
      qtd_refeicoes: Number.isFinite(refeicoes) ? refeicoes : 0,
      lanche_entre_refeicoes: yesNoToBool(formData.fazLanches),
      horario_alimentacao: formData.horariosRefeicoes?.trim() || 'Horários flexíveis',
      prepara_propria_refeicao: yesNoToBool(formData.preparaRefeicoes),
      onde_come: formData.ondeCome || 'Não informado',
      possui_alergias: Boolean(formData.alergias?.trim().length),
      possui_condicao_medica: formData.condicoesMedicas?.trim() || 'Nenhuma',
      uso_suplementos: Boolean(formData.suplementosMedicacao?.trim().length),
    };
  }, [formData, yesNoToBool]);

  const isFormValid = useMemo(() => {
    const idadeNumber = Number(formData.idade);
    const alturaNumber = Number(formData.altura);
    const pesoAtualNumber = Number(formData.pesoAtual);
    const pesoObjetivoNumber = Number(formData.pesoObjetivo);

    const comeForaOk =
      formData.comeFora.trim().length > 0 &&
      (formData.comeFora !== 'Sim' || (formData.comeFora === 'Sim' && formData.vezesForaSemana.trim().length > 0));

    const tipoAlimentacaoOk =
      formData.tipoAlimentacao.trim().length > 0 &&
      (formData.tipoAlimentacao !== 'Outra' || formData.tipoAlimentacaoOutra.trim().length > 0);

    return (
      formData.sexo.trim().length > 0 &&
      formData.idade.trim().length > 0 && Number.isFinite(idadeNumber) && idadeNumber > 0 &&
      formData.altura.trim().length > 0 && Number.isFinite(alturaNumber) && alturaNumber > 0 &&
      formData.pesoAtual.trim().length > 0 && Number.isFinite(pesoAtualNumber) && pesoAtualNumber > 0 &&
      formData.pesoObjetivo.trim().length > 0 && Number.isFinite(pesoObjetivoNumber) && pesoObjetivoNumber > 0 &&
      formData.objetivoDieta.trim().length > 0 &&
      formData.rotinaAlimentacao.trim().length > 0 &&
      formData.orcamentoMensal.trim().length > 0 &&
      formData.priorizarAcessivel.trim().length > 0 &&
      comeForaOk &&
      tipoAlimentacaoOk &&
      formData.refeicoesPorDia.trim().length > 0 &&
      formData.fazLanches.trim().length > 0 &&
      formData.preparaRefeicoes.trim().length > 0 &&
      formData.ondeCome.trim().length > 0
    );
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) {
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = await buildPayload();
      const { dietPlan, rawPlan } = await generateDietPlanFromIA(payload);
      setIsLoading(false);
      navigation.navigate('DietPlan', { dietPlan, rawPlan, anamnesis: payload });
    } catch (error) {
      setIsLoading(false);
      const message = error instanceof Error ? error.message : 'Não foi possível gerar sua dieta. Tente novamente.';
      Alert.alert('Erro ao gerar dieta', message);
      console.error('Erro ao gerar dieta:', error);
    }
  }, [isFormValid, buildPayload, navigation]);

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const Selector = React.memo(({ field, options, multiple = false, placeholder }: SelectorProps) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const scrollPositionRef = useRef(0);

    // Memoizar o valor do campo para evitar re-renders
    const fieldValue = useMemo(() => formData[field], [formData, field]);
    
    const displayText = useMemo(() => {
      const value = fieldValue as string;
      return value || placeholder;
    }, [fieldValue, placeholder]);

    const isOpen = openSelector === field;

    const dropdownHeight = useMemo(() => {
      const itemHeight = 49;
      const maxItems = 5;
      const extraPadding = 2;
      const maxHeight = itemHeight * maxItems + extraPadding;
      const calculatedHeight = options.length * itemHeight + extraPadding;
      return Math.min(calculatedHeight, maxHeight);
    }, [options.length]);

    const needsScroll = useMemo(() => options.length > 5, [options.length]);

    const onOptionPress = useCallback((option: string) => {
      handleOptionSelect(field, option);
    }, [field, handleOptionSelect]);

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
          >
            {options.map((option, index) => {
              const isSelected = fieldValue === option;

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
                  {isSelected && (
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
    return (
      prevProps.field === nextProps.field &&
      prevProps.placeholder === nextProps.placeholder &&
      prevProps.multiple === nextProps.multiple &&
      prevProps.options.length === nextProps.options.length
    );
  });

  return (
    <View style={intelligentWorkoutStyles.container}>
      <AppHeader
        title="WEIGHT"
        onSettingsPress={handleSettings}
      />

      <InfoModal
        visible={showIntroModal}
        title="Dieta Inteligente com IA"
        message="Nossa IA monta um plano alimentar personalizado com base na sua anamnese. Use-o como ponto de partida seguro."
        highlights={[
          'As sugestões levam em conta seus objetivos, rotina e restrições informadas, mas não substituem acompanhamento nutricional presencial.',
          'Revise cada refeição, ajuste conforme preferências reais e solicite alterações apenas antes de aceitar o plano; após a confirmação não será possível pedir ajustes.',
          'Verifique intolerâncias, alergias e restrições médicas antes de seguir qualquer recomendação.',
          'Ao continuar, você confirma que as informações fornecidas são verdadeiras e que buscará um profissional de saúde para avaliações detalhadas quando necessário.',
        ]}
        confirmText="Entendi, iniciar anamnese"
        onConfirm={() => setShowIntroModal(false)}
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

      <LoadingModal
        visible={isLoading}
        title="Criando sua dieta personalizada..."
        subtitle="Isso pode levar alguns segundos"
      />

      <Animated.ScrollView 
        style={[intelligentWorkoutStyles.content, { opacity: fadeAnim }]} 
        showsVerticalScrollIndicator={false}
        pointerEvents={showIntroModal ? 'none' : 'auto'}
      >
        <View style={intelligentWorkoutStyles.titleContainer}>
          <Text style={intelligentWorkoutStyles.title}>DIETA INTELIGENTE</Text>
          <View style={intelligentWorkoutStyles.titleUnderline} />
        </View>

        {/* Informações Básicas */}
        <View style={intelligentWorkoutStyles.section}>
          <Text style={intelligentWorkoutStyles.sectionTitle}>Informações Básicas</Text>
          
          <Text style={intelligentWorkoutStyles.questionLabel}>Qual seu sexo? <Text style={intelligentWorkoutStyles.asterisk}>*</Text></Text>
          <Selector
            field="sexo"
            options={sexoOptions}
            placeholder="Selecione seu sexo"
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>Qual sua idade? <Text style={intelligentWorkoutStyles.asterisk}>*</Text></Text>
          <TextInput
            style={intelligentWorkoutStyles.input}
            placeholder="Digite sua idade"
            placeholderTextColor="#999999"
            value={formData.idade}
            onChangeText={(value) => handleNumericChange('idade', value)}
            keyboardType="numeric"
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>Qual sua altura (cm)? <Text style={intelligentWorkoutStyles.asterisk}>*</Text></Text>
          <TextInput
            style={intelligentWorkoutStyles.input}
            placeholder="Ex: 175"
            placeholderTextColor="#999999"
            value={formData.altura}
            onChangeText={(value) => handleNumericChange('altura', value)}
            keyboardType="numeric"
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>Qual seu peso atual (kg)? <Text style={intelligentWorkoutStyles.asterisk}>*</Text></Text>
          <TextInput
            style={intelligentWorkoutStyles.input}
            placeholder="Ex: 75.5"
            placeholderTextColor="#999999"
            value={formData.pesoAtual}
            onChangeText={(value) => handleNumericChange('pesoAtual', value)}
            keyboardType="decimal-pad"
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>Qual seu peso objetivo (kg)? <Text style={intelligentWorkoutStyles.asterisk}>*</Text></Text>
          <TextInput
            style={intelligentWorkoutStyles.input}
            placeholder="Ex: 70.0"
            placeholderTextColor="#999999"
            value={formData.pesoObjetivo}
            onChangeText={(value) => handleNumericChange('pesoObjetivo', value)}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Objetivo da Dieta */}
        <View style={intelligentWorkoutStyles.section}>
          <Text style={intelligentWorkoutStyles.sectionTitle}>Objetivo da Dieta</Text>
          
          <Text style={intelligentWorkoutStyles.questionLabel}>
            Qual seu principal objetivo com a dieta? <Text style={intelligentWorkoutStyles.asterisk}>*</Text>
          </Text>
          <Selector
            field="objetivoDieta"
            options={objetivoDietaOptions}
            placeholder="Selecione seu objetivo"
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>
            Você tem uma data-meta para alcançar seu objetivo? (opcional)
          </Text>
          <TextInput
            style={intelligentWorkoutStyles.input}
            placeholder="Ex: 3 meses, 6 meses, etc."
            placeholderTextColor="#999999"
            value={formData.dataMeta}
            onChangeText={(value) => handleInputChange('dataMeta', value)}
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>
            Como você avalia sua rotina atual de alimentação? <Text style={intelligentWorkoutStyles.asterisk}>*</Text>
          </Text>
          <Selector
            field="rotinaAlimentacao"
            options={rotinaAlimentacaoOptions}
            placeholder="Selecione sua avaliação"
          />
        </View>

        {/* Orçamento Alimentar */}
        <View style={intelligentWorkoutStyles.section}>
          <Text style={intelligentWorkoutStyles.sectionTitle}>Orçamento Alimentar</Text>
          
          <Text style={intelligentWorkoutStyles.questionLabel}>
            Qual seu orçamento mensal aproximado para alimentação? <Text style={intelligentWorkoutStyles.asterisk}>*</Text>
          </Text>
          <Selector
            field="orcamentoMensal"
            options={orcamentoOptions}
            placeholder="Selecione seu orçamento"
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>
            Deseja que a IA priorize alimentos mais acessíveis dentro do plano? <Text style={intelligentWorkoutStyles.asterisk}>*</Text>
          </Text>
          <Selector
            field="priorizarAcessivel"
            options={simNaoOptions}
            placeholder="Selecione"
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>
            Costuma comer fora de casa? <Text style={intelligentWorkoutStyles.asterisk}>*</Text>
          </Text>
          <Selector
            field="comeFora"
            options={simNaoOptions}
            placeholder="Selecione"
          />

          {formData.comeFora === 'Sim' && (
            <>
              <Text style={intelligentWorkoutStyles.questionLabel}>
                Se sim: quantas vezes por semana, em média? <Text style={intelligentWorkoutStyles.asterisk}>*</Text>
              </Text>
              <TextInput
                style={intelligentWorkoutStyles.input}
                placeholder="Ex: 3"
                placeholderTextColor="#999999"
                value={formData.vezesForaSemana}
                onChangeText={(value) => handleNumericChange('vezesForaSemana', value)}
                keyboardType="numeric"
              />
            </>
          )}
        </View>

        {/* Preferências Alimentares */}
        <View style={intelligentWorkoutStyles.section}>
          <Text style={intelligentWorkoutStyles.sectionTitle}>Preferências Alimentares</Text>
          
          <Text style={intelligentWorkoutStyles.questionLabel}>
            Você segue algum tipo de alimentação específica? <Text style={intelligentWorkoutStyles.asterisk}>*</Text>
          </Text>
          <Selector
            field="tipoAlimentacao"
            options={tipoAlimentacaoOptions}
            placeholder="Selecione o tipo"
          />

          {formData.tipoAlimentacao === 'Outra' && (
            <>
              <Text style={intelligentWorkoutStyles.questionLabel}>
                Especifique o tipo de alimentação: <Text style={intelligentWorkoutStyles.asterisk}>*</Text>
              </Text>
              <TextInput
                style={intelligentWorkoutStyles.input}
                placeholder="Ex: Paleo, DASH, etc."
                placeholderTextColor="#999999"
                value={formData.tipoAlimentacaoOutra}
                onChangeText={(value) => handleInputChange('tipoAlimentacaoOutra', value)}
              />
            </>
          )}

          <Text style={intelligentWorkoutStyles.questionLabel}>
            Alimentos que você gosta: (opcional)
          </Text>
          <TextInput
            style={intelligentWorkoutStyles.textArea}
            placeholder="Ex: frango, salmão, batata-doce, aveia..."
            placeholderTextColor="#999999"
            value={formData.alimentosGosta}
            onChangeText={(value) => handleInputChange('alimentosGosta', value)}
            multiline
            numberOfLines={3}
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>
            Alimentos que você não gosta ou evita: (opcional)
          </Text>
          <TextInput
            style={intelligentWorkoutStyles.textArea}
            placeholder="Ex: brócolis, peixe, etc."
            placeholderTextColor="#999999"
            value={formData.alimentosNaoGosta}
            onChangeText={(value) => handleInputChange('alimentosNaoGosta', value)}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Rotina e Hábitos */}
        <View style={intelligentWorkoutStyles.section}>
          <Text style={intelligentWorkoutStyles.sectionTitle}>Rotina e Hábitos</Text>
          
          <Text style={intelligentWorkoutStyles.questionLabel}>
            Quantas refeições principais você faz por dia? <Text style={intelligentWorkoutStyles.asterisk}>*</Text>
          </Text>
          <Selector
            field="refeicoesPorDia"
            options={refeicoesPorDiaOptions}
            placeholder="Selecione a quantidade"
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>
            Você costuma fazer lanches entre as refeições? <Text style={intelligentWorkoutStyles.asterisk}>*</Text>
          </Text>
          <Selector
            field="fazLanches"
            options={simNaoOptions}
            placeholder="Selecione"
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>
            Que horários costuma se alimentar? (opcional)
          </Text>
          <TextInput
            style={intelligentWorkoutStyles.input}
            placeholder="Ex: 8h, 12h, 19h"
            placeholderTextColor="#999999"
            value={formData.horariosRefeicoes}
            onChangeText={(value) => handleInputChange('horariosRefeicoes', value)}
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>
            Você prepara suas próprias refeições? <Text style={intelligentWorkoutStyles.asterisk}>*</Text>
          </Text>
          <Selector
            field="preparaRefeicoes"
            options={simNaoOptions}
            placeholder="Selecione"
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>
            Onde costuma se alimentar durante o dia? <Text style={intelligentWorkoutStyles.asterisk}>*</Text>
          </Text>
          <Selector
            field="ondeCome"
            options={ondeComeOptions}
            placeholder="Selecione o local"
          />
        </View>

        {/* Restrições e Condições Especiais */}
        <View style={intelligentWorkoutStyles.section}>
          <Text style={intelligentWorkoutStyles.sectionTitle}>Restrições e Condições Especiais</Text>
          
          <Text style={intelligentWorkoutStyles.questionLabel}>
            Possui alguma alergia alimentar? (opcional)
          </Text>
          <TextInput
            style={intelligentWorkoutStyles.textArea}
            placeholder="Ex: lactose, glúten, frutos do mar, etc."
            placeholderTextColor="#999999"
            value={formData.alergias}
            onChangeText={(value) => handleInputChange('alergias', value)}
            multiline
            numberOfLines={3}
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>
            Possui alguma condição médica relevante? (opcional)
          </Text>
          <TextInput
            style={intelligentWorkoutStyles.textArea}
            placeholder="Ex: diabetes, hipertensão, etc."
            placeholderTextColor="#999999"
            value={formData.condicoesMedicas}
            onChangeText={(value) => handleInputChange('condicoesMedicas', value)}
            multiline
            numberOfLines={3}
          />

          <Text style={intelligentWorkoutStyles.questionLabel}>
            Está fazendo uso de algum suplemento ou medicação atualmente? (opcional)
          </Text>
          <TextInput
            style={intelligentWorkoutStyles.textArea}
            placeholder="Ex: whey protein, creatina, medicação X..."
            placeholderTextColor="#999999"
            value={formData.suplementosMedicacao}
            onChangeText={(value) => handleInputChange('suplementosMedicacao', value)}
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
            style={[intelligentWorkoutStyles.submitButton, (!isFormValid || showIntroModal) && intelligentWorkoutStyles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid || showIntroModal}
          >
            <Text style={intelligentWorkoutStyles.submitButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default IntelligentDietScreen;

