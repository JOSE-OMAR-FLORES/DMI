import React, { useRef } from 'react';
import { TouchableOpacity, Text, Animated } from 'react-native';
import { GLOBAL_STYLES } from '../constants/styles';

const CustomButton = ({ title, onPress, style, textStyle, disabled = false }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 4,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View 
        style={[
          GLOBAL_STYLES.button, 
          style,
          disabled && { opacity: 0.6 },
          { transform: [{ scale: scaleValue }] }
        ]}
      >
        <Text style={[GLOBAL_STYLES.buttonText, textStyle]}>
          {title}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default CustomButton;