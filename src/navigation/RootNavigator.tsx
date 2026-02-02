import React from 'react';
import { View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import type { AuthStackParamList, MainStackParamList, TabsParamList } from './types';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TaskListScreen from '../screens/TaskListScreen';
import TaskFormScreen from '../screens/TaskFormScreen';
import ProfileScreen from '../screens/ProfileScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tabs = createBottomTabNavigator<TabsParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const TabsNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
      tabBarActiveTintColor: '#ffffff',
      tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.65)',
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 70 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 8,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        backgroundColor: '#0f172a',
          position: 'relative',
          overflow: 'hidden',
          marginHorizontal: 0,
          marginBottom: 0,
          elevation: 12,
          shadowColor: '#0f172a',
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: -6 },
          shadowRadius: 12,
        },
      }}
    >
    <Tabs.Screen
      name="Tasks"
      component={TaskListScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="check-circle-outline" color={color} size={size} />
        ),
      }}
    />
    <Tabs.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="account-circle-outline" color={color} size={size} />
        ),
      }}
    />
    </Tabs.Navigator>
  );
};

const MainNavigator = () => (
  <MainStack.Navigator>
    <MainStack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
    <MainStack.Screen
      name="TaskForm"
      component={TaskFormScreen}
      options={({ route }) => ({
        title: route.params.mode === 'edit' ? 'Edit Task' : 'New Task',
        presentation: 'modal',
      })}
    />
  </MainStack.Navigator>
);

const LoadingScreen = () => {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
};

const RootNavigator = () => {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
