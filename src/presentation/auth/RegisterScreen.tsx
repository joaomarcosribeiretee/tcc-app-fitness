import React, { useMemo, useState, useCallback, useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { AuthViewModel } from "../viewmodels/AuthViewModel";
import { ValidatedInput } from "../components/ui/ValidatedInput";
import SuccessModal from "../components/ui/SuccessModal";
import { authStyles } from "../styles/authStyles";
import { colors } from "../styles/colors";

export default function RegisterScreen({ navigation }: any) {
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [vmState, setVmState] = useState({ loading: false, errors: {} } as any);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const vm = useMemo(() => new AuthViewModel(setVmState), []);

  // Limpar erros quando a tela for focada
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      vm.clearErrors();
    });

    return unsubscribe;
  }, [navigation, vm]);

  const handleRegister = useCallback(async () => {
    const ok = await vm.register(nome, username, email, senha, confirmarSenha);
    if (ok) {
      // Mostrar modal de sucesso
      setShowSuccessModal(true);
    }
  }, [vm, nome, username, email, senha, confirmarSenha]);

  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    // Redirecionar para Login após fechar modal
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }, [navigation]);

  return (
    <KeyboardAvoidingView style={authStyles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={authStyles.content}>
          <Text style={authStyles.welcomeTitle}>Criar Conta</Text>
          <Text style={authStyles.welcomeSubtitle}>Preencha os dados para se cadastrar</Text>

          <View style={authStyles.inputContainer}>
            {vmState.errors.geral && (
              <View style={authStyles.generalErrorContainer}>
                <Text style={authStyles.generalErrorText}>{vmState.errors.geral}</Text>
              </View>
            )}
            <ValidatedInput
              placeholder="Nome completo"
              value={nome}
              onChangeText={setNome}
              error={vmState.errors.nome}
              autoCapitalize="words"
            />

            <ValidatedInput
              placeholder="Nome de usuário"
              value={username}
              onChangeText={setUsername}
              error={vmState.errors.username}
              autoCapitalize="none"
            />

            <ValidatedInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              error={vmState.errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <ValidatedInput
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              error={vmState.errors.senha}
              secureTextEntry={true}
            />

            <ValidatedInput
              placeholder="Confirmar senha"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              error={vmState.errors.confirmarSenha}
              secureTextEntry={true}
            />
          </View>

          <TouchableOpacity
            style={[authStyles.registerButton, vmState.loading && authStyles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={vmState.loading}
          >
            {vmState.loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={authStyles.registerButtonText}>CADASTRAR</Text>
            )}
          </TouchableOpacity>

          <View style={authStyles.loginContainer}>
            <Text style={authStyles.loginText}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")} disabled={vmState.loading}>
              <Text style={authStyles.loginLink}>Faça login</Text>
            </TouchableOpacity>
          </View>

          {/* Modal de Sucesso */}
          <SuccessModal
            visible={showSuccessModal}
            title="Conta criada com sucesso!"
            message="Seu cadastro foi realizado. Faça login para continuar."
            buttonText="Ir para login"
            onClose={handleSuccessModalClose}
          />
        </View>
    </KeyboardAvoidingView>
  );
}
