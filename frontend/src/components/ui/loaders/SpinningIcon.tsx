import NativeIcon from '@/components/Icon/NativeIcon';
import useColors from '@/styles/useColors';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

const SpinningIcon:React.FC<{mode:'dark'|'light'}> = ({mode='dark'}) => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  const {textPrimary,textOnPrimary}=useColors()

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000, // 1 second per rotation
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <NativeIcon library="AntDesign" name="loading2" size={24} color={mode=='dark'?textOnPrimary.color:textPrimary.color} />
    </Animated.View>
  );
};

export default SpinningIcon;