import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

/**
 * Componente Text personalizado con tema oscuro
 * Color blanco por defecto para máxima visibilidad
 */
const CustomText = ({ style, children, ...props }) => {
  return (
    <RNText 
      {...props} 
      style={[styles.defaultText, style]}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    color: COLORS.textPrimary, // #FFFFFF - Blanco por defecto
  },
});

export default CustomText;
