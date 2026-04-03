import React from 'react';
import { View, Text, TextInput, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING } from '../constants';

const Input = ({ 
  label, 
  placeholder, 
  error, 
  value, 
  onChangeText, 
  secureTextEntry, 
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  disabled = false,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.errorInput, disabled && styles.disabledInput]}
        placeholder={placeholder}
        placeholderTextColor="#52525B"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={!disabled}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    width: '100%',
  },
  label: {
    color: '#A1A1AA', // zinc-400
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 56,
    backgroundColor: '#0A0A0A', // Black
    borderWidth: 1,
    borderColor: '#27272A', // zinc-800
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  errorInput: {
    borderColor: '#EF4444', 
  },
  disabledInput: {
    opacity: 0.5,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
    marginLeft: 4,
  },
});

export default Input;
