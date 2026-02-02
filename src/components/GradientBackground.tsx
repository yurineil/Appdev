import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type GradientBackgroundProps = {
  children: React.ReactNode;
};

const GradientBackground = ({ children }: GradientBackgroundProps) => (
  <LinearGradient colors={['#0b4aa2', '#0a3274']} style={styles.container}>
    {children}
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GradientBackground;
