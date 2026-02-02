import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View, ScrollView } from 'react-native';
import { Button, HelperText, Surface, Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../context/AuthContext';
import type { AuthStackParamList } from '../navigation/types';
import { hasMinLength, isValidEmail } from '../utils/validation';

const MIN_PASSWORD_LENGTH = 6;

const LoginScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Login'>>();
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const emailError = submitted && !isValidEmail(email);
  const passwordError = submitted && !hasMinLength(password, MIN_PASSWORD_LENGTH);

  const handleLogin = async () => {
    setSubmitted(true);
    setErrorMessage('');
    if (emailError || passwordError) {
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#0b2f6a', '#0a3a7a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoSection}>
            <Text variant="displaySmall" style={styles.appName}>
              My Daily Task
            </Text>
            <Text variant="bodyLarge" style={styles.tagline}>
              Empowering farmers, nurturing growth
            </Text>
          </View>

          {/* Form Card */}
          <Surface style={styles.formCard} elevation={4}>
            <Text variant="headlineSmall" style={styles.formTitle}>
              Welcome Back
            </Text>
            <Text variant="bodyMedium" style={styles.formSubtitle}>
              Sign in to continue to your account
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                label="Email Address"
                mode="outlined"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                error={emailError}
                style={styles.input}
                outlineStyle={styles.inputOutline}
                contentStyle={styles.inputContent}
                left={<TextInput.Icon icon="email-outline" />}
              />
              {emailError && (
                <HelperText type="error" visible={emailError} style={styles.helperText}>
                  Please enter a valid email address
                </HelperText>
              )}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Password"
                mode="outlined"
                autoCapitalize="none"
                secureTextEntry={!passwordVisible}
                autoComplete="password"
                value={password}
                onChangeText={setPassword}
                error={passwordError}
                style={styles.input}
                outlineStyle={styles.inputOutline}
                contentStyle={styles.inputContent}
                left={<TextInput.Icon icon="lock-outline" />}
                right={
                  <TextInput.Icon
                    icon={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                    onPress={() => setPasswordVisible((prev) => !prev)}
                  />
                }
              />
              {passwordError && (
                <HelperText type="error" visible={passwordError} style={styles.helperText}>
                  Password must be at least {MIN_PASSWORD_LENGTH} characters
                </HelperText>
              )}
            </View>

            {errorMessage ? (
              <Surface style={styles.errorBanner} elevation={0}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </Surface>
            ) : null}

            <Button
              mode="contained"
              loading={submitting}
              disabled={submitting}
              onPress={handleLogin}
              style={styles.signInButton}
              contentStyle={styles.signInButtonContent}
              labelStyle={styles.signInButtonLabel}
            >
              Sign In
            </Button>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.footer}>
              <Text variant="bodyMedium" style={styles.footerText}>
                Don't have an account?
              </Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Register')}
                labelStyle={styles.createAccountLabel}
                contentStyle={styles.createAccountContent}
              >
                Create Account
              </Button>
            </View>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    color: '#ffffff',
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    fontWeight: '400',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  formTitle: {
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  formSubtitle: {
    color: '#6b7280',
    marginBottom: 28,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#ffffff',
  },
  inputOutline: {
    borderRadius: 12,
    borderWidth: 1.5,
  },
  inputContent: {
    paddingVertical: 6,
  },
  helperText: {
    marginTop: 4,
    marginLeft: 4,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
    fontWeight: '500',
  },
  signInButton: {
    borderRadius: 12,
    marginTop: 8,
  },
  signInButtonContent: {
    height: 52,
  },
  signInButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: {
    color: '#6b7280',
  },
  createAccountLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  createAccountContent: {
    paddingHorizontal: 4,
  },
});

export default LoginScreen;