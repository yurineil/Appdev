import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, HelperText, Surface, Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import type { AuthStackParamList } from '../navigation/types';
import { hasMinLength, isValidEmail } from '../utils/validation';
import GradientBackground from '../components/GradientBackground';

const MIN_PASSWORD_LENGTH = 6;
const MIN_NAME_LENGTH = 2;

const RegisterScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Register'>>();
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const nameError = submitted && !hasMinLength(name, MIN_NAME_LENGTH);
  const emailError = submitted && !isValidEmail(email);
  const passwordError = submitted && !hasMinLength(password, MIN_PASSWORD_LENGTH);
  const confirmError = submitted && password !== confirmPassword;

  const handleRegister = async () => {
    setSubmitted(true);
    setErrorMessage('');
    if (nameError || emailError || passwordError || confirmError) {
      return;
    }
    setSubmitting(true);
    try {
      await signUp(name, email, password);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign up right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <MaterialCommunityIcons name="account-plus-outline" color="#ffffff" size={28} />
            </View>
            <Text variant="headlineMedium" style={styles.brandTitle}>
              Create account
            </Text>
            <Text variant="bodyMedium" style={styles.brandSubtitle}>
              Start tracking what matters with a fresh workspace.
            </Text>
          </View>
          <Surface style={styles.card} elevation={3}>
          <TextInput
            label="Name"
            mode="outlined"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
            error={nameError}
          />
          <HelperText type="error" visible={nameError}>
            Name must be at least {MIN_NAME_LENGTH} characters.
          </HelperText>
          <TextInput
            label="Email"
            mode="outlined"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            error={emailError}
          />
          <HelperText type="error" visible={emailError}>
            Enter a valid email address.
          </HelperText>
          <TextInput
            label="Password"
            mode="outlined"
            autoCapitalize="none"
            secureTextEntry={!passwordVisible}
            autoComplete="new-password"
            value={password}
            onChangeText={setPassword}
            error={passwordError}
            right={
              <TextInput.Icon
                icon={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                onPress={() => setPasswordVisible((prev) => !prev)}
              />
            }
          />
          <HelperText type="error" visible={passwordError}>
            Password must be at least {MIN_PASSWORD_LENGTH} characters.
          </HelperText>
          <TextInput
            label="Confirm password"
            mode="outlined"
            autoCapitalize="none"
            secureTextEntry={!passwordVisible}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={confirmError}
          />
          <HelperText type="error" visible={confirmError}>
            Passwords do not match.
          </HelperText>
          {errorMessage ? (
            <HelperText type="error" visible>
              {errorMessage}
            </HelperText>
          ) : null}
          <Button mode="contained" loading={submitting} onPress={handleRegister}>
            Create account
          </Button>
          <Button mode="text" onPress={() => navigation.navigate('Login')} compact>
            Already have an account? Sign in
          </Button>
          </Surface>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 24,
  },
  brand: { gap: 8, alignItems: 'center' },
  brandIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: { color: '#ffffff' },
  brandSubtitle: { color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center' },
  card: {
    padding: 20,
    borderRadius: 20,
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
  },
});

export default RegisterScreen;
