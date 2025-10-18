import React, { useMemo, useState, useCallback, useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { AuthViewModel } from "../viewmodels/AuthViewModel";
import { ValidatedInput } from "../components/ui/ValidatedInput";
import { authStyles } from "../styles/authStyles";
import { colors } from "../styles/colors";

export default function RegisterScreen({ navigation }: any) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [vmState, setVmState] = useState({ loading: false, errors: {} } as any);
  
  const vm = useMemo(() => new AuthViewModel(setVmState), []);

  // Limpar erros quando a tela for focada
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      vm.clearErrors();
    });

    return unsubscribe;
  }, [navigation, vm]);

  const handleRegister = useCallback(async () => {
    const ok = await vm.register(nome, email, senha, confirmarSenha);
    if (ok) {
      // Reseta a pilha de navegação para Main, sem possibilidade de voltar
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  }, [vm, nome, email, senha, confirmarSenha, navigation]);

  return (
    <KeyboardAvoidingView style={authStyles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={authStyles.content}>
          <Text style={authStyles.welcomeTitle}>Criar Conta</Text>
          <Text style={authStyles.welcomeSubtitle}>Preencha os dados para se cadastrar</Text>

          {vmState.errors.geral && (
            <Text style={authStyles.feedbackText}>{vmState.errors.geral}</Text>
          )}

          <View style={authStyles.inputContainer}>
            <ValidatedInput
              placeholder="Nome completo"
              value={nome}
              onChangeText={setNome}
              error={vmState.errors.nome}
              autoCapitalize="words"
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
        </View>
    </KeyboardAvoidingView>
  );
}
