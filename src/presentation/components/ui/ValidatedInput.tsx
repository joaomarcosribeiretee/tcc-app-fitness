import React, { memo } from 'react';
import { View, TextInput, Text } from 'react-native';
import { authStyles } from '../../styles/authStyles';
import { colors } from '../../styles/colors';

interface ValidatedInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words';
}

export const ValidatedInput = memo<ValidatedInputProps>(({
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none'
}) => {
  const hasError = !!error;
  const inputStyle = [
    authStyles.input,
    hasError && authStyles.inputError
  ];

  const containerStyle = [
    authStyles.inputWrapper,
    hasError && authStyles.inputWrapperError
  ];

  return (
    <View style={containerStyle}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={inputStyle}
      />
      
      {error && (
        <Text style={authStyles.fieldErrorText}>
          {error}
        </Text>
      )}
    </View>
  );
});

ValidatedInput.displayName = 'ValidatedInput';
