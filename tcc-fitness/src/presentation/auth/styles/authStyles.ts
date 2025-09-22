import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.secondary,
    marginBottom: 40,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: colors.error,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: colors.primary,
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.primary,
    marginBottom: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  eyeText: {
    fontSize: 20,
  },
  loginButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonDisabled: {
    backgroundColor: colors.accentDisabled,
  },
  loginButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  registerButtonDisabled: {
    backgroundColor: colors.accentDisabled,
  },
  registerButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: colors.secondary,
    fontSize: 16,
  },
  registerLink: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: colors.secondary,
    fontSize: 16,
  },
  loginLink: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
});
