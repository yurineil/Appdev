import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, IconButton, Surface, Text, TextInput } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import type { MainStackParamList } from '../navigation/types';
import { getTasks, setTasks as saveTasks } from '../storage';
import type { Task } from '../types';
import { createId } from '../utils/id';
import { hasMinLength } from '../utils/validation';
import GradientBackground from '../components/GradientBackground';

type Props = NativeStackScreenProps<MainStackParamList, 'TaskForm'>;

const MIN_TITLE_LENGTH = 3;

const TaskFormScreen = ({ route, navigation }: Props) => {
  const { mode, task } = route.params;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState(task?.title ?? '');
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [completed, setCompleted] = useState(task?.completed ?? false);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isTitleValid = useMemo(() => hasMinLength(title, MIN_TITLE_LENGTH), [title]);

  const handleSave = async () => {
    if (!user) {
      return;
    }
    setSubmitted(true);
    setErrorMessage('');
    if (!isTitleValid) {
      return;
    }
    setSaving(true);
    try {
      const existing = await getTasks(user.id);
      const now = new Date().toISOString();
      let updated: Task[];

      if (mode === 'edit' && task) {
        const found = existing.some((item) => item.id === task.id);
        const updatedTask: Task = {
          id: task.id,
          title: title.trim(),
          notes: notes.trim() ? notes.trim() : undefined,
          completed,
          createdAt: task.createdAt,
          updatedAt: now,
        };
        updated = found
          ? existing.map((item) => (item.id === task.id ? updatedTask : item))
          : [updatedTask, ...existing];
      } else {
        const newTask: Task = {
          id: createId(),
          title: title.trim(),
          notes: notes.trim() ? notes.trim() : undefined,
          completed: false,
          createdAt: now,
          updatedAt: now,
        };
        updated = [newTask, ...existing];
      }

      await saveTasks(user.id, updated);
      navigation.goBack();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save your task.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 },
          ]}
        >
          <View style={styles.hero}>
            <Text variant="headlineSmall" style={styles.heroTitle}>
              {mode === 'edit' ? 'Update task details' : 'Create a new task'}
            </Text>
            <Text variant="bodyMedium" style={styles.heroSubtitle}>
              Capture what needs your attention and stay on schedule.
            </Text>
          </View>
          <Surface style={styles.card} elevation={3}>
            <View style={styles.form}>
              <TextInput
                label="Title"
                mode="outlined"
                value={title}
                onChangeText={setTitle}
                error={submitted && !isTitleValid}
              />
              <HelperText type="error" visible={submitted && !isTitleValid}>
                Title must be at least {MIN_TITLE_LENGTH} characters.
              </HelperText>
              <TextInput
                label="Notes"
                mode="outlined"
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
              />
              {mode === 'edit' ? (
                <View style={styles.checkboxRow}>
                  <IconButton
                    icon={completed ? 'check-circle' : 'checkbox-blank-circle-outline'}
                    iconColor={completed ? '#16a34a' : '#94a3b8'}
                    size={24}
                    onPress={() => setCompleted(!completed)}
                    style={styles.statusIcon}
                  />
                  <Text variant="bodyMedium">Mark as completed</Text>
                </View>
              ) : null}
              {errorMessage ? (
                <HelperText type="error" visible>
                  {errorMessage}
                </HelperText>
              ) : null}
              <Button mode="contained" loading={saving} onPress={handleSave}>
                {mode === 'edit' ? 'Save changes' : 'Create task'}
              </Button>
            </View>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: 20,
    gap: 24,
  },
  hero: { gap: 8, paddingTop: 8 },
  heroTitle: { color: '#ffffff' },
  heroSubtitle: { color: 'rgba(255, 255, 255, 0.8)' },
  card: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
  },
  form: { gap: 12 },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIcon: {
    margin: 0,
  },
});

export default TaskFormScreen;
