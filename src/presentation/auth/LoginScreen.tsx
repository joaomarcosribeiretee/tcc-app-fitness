import React, { useMemo, useState, useCallback, useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { AuthViewModel } from "../viewmodels/AuthViewModel";
import { ValidatedInput } from "../components/ui/ValidatedInput";
import { authStyles } from "../styles/authStyles";
import { colors } from "../styles/colors";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [vmState, setVmState] = useState({ loading: false, errors: {} } as any);

  const vm = useMemo(() => new AuthViewModel(setVmState), []);

  // Limpar erros quando a tela for focada
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      vm.clearErrors();
    });

    return unsubscribe;
  }, [navigation, vm]);

  const handleLogin = useCallback(async () => {
    const ok = await vm.login(email, senha);
    if (ok) {
      // Reseta a pilha de navegação para Main, sem possibilidade de voltar
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  }, [vm, email, senha, navigation]);

  return (
    <KeyboardAvoidingView style={authStyles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={authStyles.content}>
          <Text style={authStyles.welcomeTitle}>Bem-vindo!</Text>
          <Text style={authStyles.welcomeSubtitle}>Faça login para continuar</Text>

          {vmState.errors.geral && (
            <Text style={authStyles.feedbackText}>{vmState.errors.geral}</Text>
          )}

          <View style={authStyles.inputContainer}>
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
          </View>

          <TouchableOpacity
            style={[authStyles.loginButton, vmState.loading && authStyles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={vmState.loading}
          >
            {vmState.loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={authStyles.loginButtonText}>ENTRAR</Text>
            )}
          </TouchableOpacity>

          <View style={authStyles.registerContainer}>
            <Text style={authStyles.registerText}>Não tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")} disabled={vmState.loading}>
              <Text style={authStyles.registerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </View>
    </KeyboardAvoidingView>
  );
}
