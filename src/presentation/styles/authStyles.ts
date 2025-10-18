import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { fonts } from './fonts';

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    paddingTop: 0,
    paddingBottom: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  appTitle: {
    fontSize: 0,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
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
  feedbackText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.9,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  inputContainer: {
    marginBottom: 30,
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 20,
    width: '100%',
  },
  inputWrapperError: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.primary,
    width: '100%',
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  fieldErrorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  loginButtonDisabled: {
    backgroundColor: colors.accentDisabled,
  },
  loginButtonText: {
    color: colors.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  registerButtonDisabled: {
    backgroundColor: colors.accentDisabled,
  },
  registerButtonText: {
    color: colors.buttonText,
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
