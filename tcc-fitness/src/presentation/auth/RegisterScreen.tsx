import React, { useMemo, useState, useEffect } from "react";
import { View, TextInput, Text, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { AuthViewModel } from "./AuthViewModel";
import { authStyles } from "./styles/authStyles";
import { colors } from "./styles/colors";

export default function RegisterScreen({ navigation }: any) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [vmState, setVmState] = useState({ loading: false } as any);
  const vm = useMemo(() => new AuthViewModel(setVmState), []);

  useEffect(() => {
    if (vmState.token) navigation.replace("Home");
  }, [vmState.token]);

  return (
    <KeyboardAvoidingView style={authStyles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={authStyles.scrollContainer}>
        {/* Header */}
        <View style={authStyles.header}>
          <Text style={authStyles.appTitle}>FITNESS</Text>
        </View>

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
                secureTextEntry={!showPassword}
                style={authStyles.input}
              />
              <TouchableOpacity
                style={authStyles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={authStyles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>

            <View style={authStyles.passwordContainer}>
              <TextInput
                placeholder="Confirmar senha"
                placeholderTextColor={colors.placeholder}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry={!showConfirmPassword}
                style={authStyles.input}
              />
              <TouchableOpacity
                style={authStyles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={authStyles.eyeText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
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
