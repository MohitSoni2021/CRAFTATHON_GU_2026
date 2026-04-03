import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { COLORS, SPACING } from '../constants';

const Button = ({ 
  onPress, 
  title, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  leftIcon,
  style
}) => {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isOutline = variant === 'outline';

  const containerStyle = [
    styles.button,
    isPrimary && styles.primary,
    isDanger && styles.danger,
    isOutline && styles.outline,
    disabled && styles.disabled,
    style
  ];

  const textStyle = [
    styles.text,
    isPrimary && styles.textPrimary,
    isDanger && styles.textDanger,
    isOutline && styles.textOutline,
  ];

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled || loading} 
      activeOpacity={0.8}
      style={containerStyle}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary || isDanger ? 'black' : COLORS.primary} />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
          <Text style={textStyle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  primary: {
    backgroundColor: COLORS.primary || '#FACC15',
  },
  danger: {
    backgroundColor: COLORS.error || '#EF4444',
  },
  outline: {
    borderWidth: 2,
    borderColor: COLORS.primary || '#FACC15',
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textPrimary: {
    color: 'black',
  },
  textDanger: {
    color: 'white',
  },
  textOutline: {
    color: COLORS.primary || '#FACC15',
  },
});

export default Button;
