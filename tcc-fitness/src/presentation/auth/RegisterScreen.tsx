import React, { useMemo, useState, useEffect } from "react";
import { View, TextInput, Text, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from "react-native";
import { AuthViewModel } from "./AuthViewModel";
import { authStyles } from "./styles/authStyles";
import { colors } from "./styles/colors";
import { useHeaderHeight } from "@react-navigation/elements";

export default function RegisterScreen({ navigation }: any) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [vmState, setVmState] = useState({ loading: false } as any);
  const vm = useMemo(() => new AuthViewModel(setVmState), []);
  const headerHeight = useHeaderHeight();
  const windowHeight = Dimensions.get('window').height;

  useEffect(() => {
    vm.bootstrap();
    if (vmState.token) navigation.replace("Home");
  }, [vmState.token]);

  return (
    <KeyboardAvoidingView style={authStyles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[authStyles.scrollContainer, { minHeight: windowHeight - headerHeight }]}>
        {/* Header removed per design; native header handles color */}

        {/* Main Content */}
        <View style={authStyles.content}>
          <Text style={authStyles.welcomeTitle}>Criar Conta</Text>
          <Text style={authStyles.welcomeSubtitle}>Preencha os dados para se cadastrar</Text>

          {vmState.error && (
            <View style={authStyles.errorContainer}>
              <Text style={authStyles.errorText}>{vmState.error}</Text>
            </View>
          )}

          <View style={authStyles.inputContainer}>
            <TextInput
              placeholder="Nome completo"
              placeholderTextColor={colors.placeholder}
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
              style={authStyles.input}
            />

            <TextInput
              placeholder="Email"
              placeholderTextColor={colors.placeholder}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={authStyles.input}
            />

            <View style={authStyles.passwordContainer}>
              <TextInput
                placeholder="Senha"
                placeholderTextColor={colors.placeholder}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={true}
                style={authStyles.input}
              />
            </View>

            <View style={authStyles.passwordContainer}>
              <TextInput
                placeholder="Confirmar senha"
                placeholderTextColor={colors.placeholder}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry={true}
                style={authStyles.input}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[authStyles.registerButton, vmState.loading && authStyles.registerButtonDisabled]}
            onPress={() => vm.register(nome, email, senha)}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
