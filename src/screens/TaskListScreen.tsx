import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, ImageBackground, RefreshControl, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Card,
  Chip,
  FAB,
  IconButton,
  Searchbar,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import type { MainStackParamList } from '../navigation/types';
import { getTasks, setTasks as saveTasks } from '../storage';
import type { Task } from '../types';

const sortByUpdated = (items: Task[]) =>
  items
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

const TASK_IMAGES = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
];

type FilterOption = 'all' | 'pending' | 'done';

const TaskListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { user } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

  const loadTasks = useCallback(async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    const stored = await getTasks(user.id);
    setTasks(sortByUpdated(stored));
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const handleRefresh = useCallback(async () => {
    if (!user) {
      return;
    }
    setRefreshing(true);
    const stored = await getTasks(user.id);
    setTasks(sortByUpdated(stored));
    setRefreshing(false);
  }, [user]);

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    return {
      total: tasks.length,
      completed,
      pending: tasks.length - completed,
    };
  }, [tasks]);

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

  const filteredTasks = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    let filtered = tasks;
    if (activeFilter === 'pending') {
      filtered = filtered.filter((task) => !task.completed);
    }
    if (activeFilter === 'done') {
      filtered = filtered.filter((task) => task.completed);
    }
    if (normalized) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(normalized) ||
          (task.notes ?? '').toLowerCase().includes(normalized)
      );
    }
    return sortByUpdated(filtered);
  }, [activeFilter, searchQuery, tasks]);

  const handleToggle = async (task: Task) => {
    if (!user) {
      return;
    }
    const updated = tasks.map((item) =>
      item.id === task.id
        ? { ...item, completed: !item.completed, updatedAt: new Date().toISOString() }
        : item
    );
    setTasks(sortByUpdated(updated));
    await saveTasks(user.id, updated);
  };

  const handleDelete = (task: Task) => {
    if (!user) {
      return;
    }
    Alert.alert('Delete task?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = tasks.filter((item) => item.id !== task.id);
          setTasks(sortByUpdated(updated));
          await saveTasks(user.id, updated);
        },
      },
    ]);
  };

  const renderItem = ({ item, index }: { item: Task; index: number }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('TaskForm', { mode: 'edit', task: item })}>
      <ImageBackground
        source={{ uri: TASK_IMAGES[index % TASK_IMAGES.length] }}
        style={styles.cardImage}
        imageStyle={styles.cardImageStyle}
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.7)']}
          style={styles.cardOverlay}
        >
          <View style={styles.cardTopRow}>
            <Surface
              style={[styles.statusPill, item.completed ? styles.statusDone : styles.statusPending]}
              elevation={0}
            >
              <Text variant="labelSmall" style={styles.statusText}>
                {item.completed ? 'Completed' : 'In progress'}
              </Text>
            </Surface>
          </View>
          <View style={styles.cardBottom}>
            <Text variant="titleMedium" style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {item.notes ? (
              <Text variant="bodySmall" style={styles.cardNotes} numberOfLines={2}>
                {item.notes}
              </Text>
            ) : null}
          </View>
        </LinearGradient>
      </ImageBackground>
      <View style={styles.cardMeta}>
        <Text variant="labelSmall" style={styles.timestamp}>
          Updated {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
        <View style={styles.cardActions}>
          <IconButton
            icon={item.completed ? 'check-circle' : 'checkbox-blank-circle-outline'}
            iconColor={theme.colors.primary}
            size={20}
            onPress={() => handleToggle(item)}
          />
          <IconButton
            icon="pencil-outline"
            size={20}
            onPress={() => navigation.navigate('TaskForm', { mode: 'edit', task: item })}
          />
          <IconButton
            icon="trash-can-outline"
            iconColor={theme.colors.error}
            size={20}
            onPress={() => handleDelete(item)}
          />
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerRow}>
        <View>
          <Text variant="headlineSmall">Hi, {user?.name?.split(' ')[0] ?? 'there'} 👋</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Explore your tasks for today.
          </Text>
        </View>
        <Avatar.Text size={46} label={initials} style={styles.avatar} />
      </View>
      <Searchbar
        placeholder="Search tasks"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.search}
        inputStyle={styles.searchInput}
      />
      <View style={styles.filterRow}>
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'done', label: 'Done' },
        ].map((filter) => (
          <Chip
            key={filter.key}
            selected={activeFilter === filter.key}
            onPress={() => setActiveFilter(filter.key as FilterOption)}
            style={[
              styles.filterChip,
              activeFilter === filter.key ? styles.filterChipActive : undefined,
            ]}
            selectedColor={theme.colors.primary}
          >
            {filter.label}
          </Chip>
        ))}
      </View>
      <View style={styles.statsRow}>
        <Surface style={styles.statCard} elevation={1}>
          <Text variant="titleLarge">{stats.total}</Text>
          <Text variant="labelMedium">Total</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={1}>
          <Text variant="titleLarge">{stats.completed}</Text>
          <Text variant="labelMedium">Done</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={1}>
          <Text variant="titleLarge">{stats.pending}</Text>
          <Text variant="labelMedium">Pending</Text>
        </Surface>
      </View>
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 140 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="check-circle-outline" size={48} color={theme.colors.outline} />
            <Text variant="titleMedium">No tasks yet</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Tap the plus button to add your first task.
            </Text>
          </View>
        }
      />
      <FAB
        icon="plus"
        style={[styles.fab, { bottom: 24 + insets.bottom }]}
        onPress={() => navigation.navigate('TaskForm', { mode: 'create' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  subtitle: { color: '#64748b' },
  avatar: { backgroundColor: '#1d4ed8' },
  search: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: { fontSize: 15 },
  filterRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  filterChip: { backgroundColor: '#eef2ff' },
  filterChipActive: { backgroundColor: '#dbeafe' },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
  listContent: { gap: 16, paddingBottom: 120 },
  card: { borderRadius: 20, overflow: 'hidden' },
  cardImage: { height: 180, justifyContent: 'space-between' },
  cardImageStyle: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  cardOverlay: { flex: 1, padding: 16, justifyContent: 'space-between' },
  cardTopRow: { alignItems: 'flex-start' },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusPending: { backgroundColor: 'rgba(255,255,255,0.92)' },
  statusDone: { backgroundColor: 'rgba(34,197,94,0.9)' },
  statusText: { color: '#0f172a' },
  cardBottom: { gap: 4 },
  cardTitle: { color: '#ffffff' },
  cardNotes: { color: 'rgba(255,255,255,0.85)' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  cardActions: { flexDirection: 'row', alignItems: 'center' },
  timestamp: { color: '#94a3b8' },
  fab: { position: 'absolute', right: 20, bottom: 24 },
  emptyState: { alignItems: 'center', gap: 8, padding: 24 },
});

export default TaskListScreen;
