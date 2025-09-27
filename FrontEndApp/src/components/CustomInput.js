import React, { useRef, useState } from 'react';
import { TextInput, Animated } from 'react-native';
import { GLOBAL_STYLES } from '../constants/styles';
import { COLORS } from '../constants/colors';

const CustomInput = ({ 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry, 
  style,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.parallel([
      Animated.timing(borderColor, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.spring(scaleValue, {
        toValue: 1.02,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
    ]).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.parallel([
      Animated.timing(borderColor, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
    ]).start();
  };

  const animatedBorderColor = borderColor.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.lightGray, COLORS.primary],
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Animated.View
        style={[
          GLOBAL_STYLES.input,
          {
            borderColor: animatedBorderColor,
            borderWidth: isFocused ? 2 : 1,
          },
          style,
        ]}
      >
        <TextInput
          style={{
            flex: 1,
            fontSize: 16,
            color: COLORS.black,
            padding: 0,
          }}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          placeholderTextColor="#999"
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </Animated.View>
    </Animated.View>
  );
};

export default CustomInput;