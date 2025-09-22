import React, { useEffect, useMemo, useState } from "react";
import { View, TextInput, Text, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from "react-native";
import { AuthViewModel } from "./AuthViewModel";
import { authStyles } from "./styles/authStyles";
import { colors } from "./styles/colors";
import { useHeaderHeight } from "@react-navigation/elements";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
          <Text style={authStyles.welcomeTitle}>Bem-vindo de volta!</Text>
          <Text style={authStyles.welcomeSubtitle}>Faça login para continuar</Text>

          {vmState.error && (
            <View style={authStyles.errorContainer}>
              <Text style={authStyles.errorText}>{vmState.error}</Text>
            </View>
          )}

          <View style={authStyles.inputContainer}>
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
          </View>

          <TouchableOpacity
            style={[authStyles.loginButton, vmState.loading && authStyles.loginButtonDisabled]}
            onPress={() => vm.login(email, senha)}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
