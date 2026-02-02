import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  HelperText,
  Snackbar,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { getTasks } from '../storage';
import { hasMinLength } from '../utils/validation';
import GradientBackground from '../components/GradientBackground';

const MIN_NAME_LENGTH = 2;

const ProfileScreen = () => {
  const { user, signOut, updateProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(user?.name ?? '');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [stats, setStats] = useState({ total: 0, completed: 0 });

  useEffect(() => {
    setName(user?.name ?? '');
  }, [user?.name]);

  const initials = useMemo(() => {
    if (!user?.name) {
      return 'U';
    }
    return user.name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .join('')
      .slice(0, 2);
  }, [user?.name]);

  const loadStats = useCallback(async () => {
    if (!user) {
      return;
    }
    const tasks = await getTasks(user.id);
    const completed = tasks.filter((task) => task.completed).length;
    setStats({ total: tasks.length, completed });
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const handleUpdate = async () => {
    if (!user) {
      return;
    }
    setSubmitted(true);
    if (!hasMinLength(name, MIN_NAME_LENGTH)) {
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      setSnackbarMessage('Profile updated.');
    } catch (error) {
      setSnackbarMessage(error instanceof Error ? error.message : 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const nameError = submitted && !hasMinLength(name, MIN_NAME_LENGTH);

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 },
        ]}
      >
        <Surface style={styles.profileCard} elevation={3}>
          <View style={styles.profileHeader}>
            <Avatar.Text label={initials} size={56} style={styles.avatar} />
            <View>
              <Text variant="titleLarge">{user?.name ?? 'Guest'}</Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                {user?.email ?? 'No email on file'}
              </Text>
            </View>
          </View>
          <View style={styles.statRow}>
            <Surface style={styles.statCard} elevation={1}>
              <Text variant="titleLarge">{stats.total}</Text>
              <Text variant="labelMedium">Tasks</Text>
            </Surface>
            <Surface style={styles.statCard} elevation={1}>
              <Text variant="titleLarge">{stats.completed}</Text>
              <Text variant="labelMedium">Completed</Text>
            </Surface>
          </View>
        </Surface>

        <Surface style={styles.formCard} elevation={3}>
          <View style={styles.form}>
            <Text variant="titleMedium">Profile</Text>
            <TextInput label="Name" mode="outlined" value={name} onChangeText={setName} error={nameError} />
            <HelperText type="error" visible={nameError}>
              Name must be at least {MIN_NAME_LENGTH} characters.
            </HelperText>
            <TextInput label="Email" mode="outlined" value={user?.email ?? ''} editable={false} />
            <Button mode="contained" loading={saving} onPress={handleUpdate}>
              Save profile
            </Button>
            <Button mode="outlined" onPress={handleSignOut}>
              Sign out
            </Button>
          </View>
        </Surface>

        <Snackbar
          visible={Boolean(snackbarMessage)}
          onDismiss={() => setSnackbarMessage('')}
          duration={2500}
        >
          {snackbarMessage}
        </Snackbar>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, gap: 20 },
  profileCard: { padding: 16, borderRadius: 20, gap: 16, backgroundColor: 'rgba(255, 255, 255, 0.96)' },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { backgroundColor: '#1d4ed8' },
  subtitle: { color: '#64748b' },
  statRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, padding: 12, borderRadius: 14, alignItems: 'center', gap: 4 },
  formCard: { padding: 16, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.96)' },
  form: { gap: 12 },
});

export default ProfileScreen;
