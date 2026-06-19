import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { AuthProvider, useAuth } from './src/contexts/AuthContext'
import { loadLocale } from './src/i18n'
import HomeScreen from './src/screens/HomeScreen'
import HistoryScreen from './src/screens/HistoryScreen'
import LoginScreen from './src/screens/LoginScreen'
import RegisterScreen from './src/screens/RegisterScreen'
import SettingsScreen from './src/screens/SettingsScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: '#0f0f23' },
}

const tabScreenOptions = {
  headerShown: false,
  tabBarStyle: {
    backgroundColor: '#16162a',
    borderTopColor: '#2a2a4a',
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 4,
    height: 60,
  } as const,
  tabBarActiveTintColor: '#6c63ff',
  tabBarInactiveTintColor: '#888',
  tabBarLabelStyle: { fontSize: 11, fontWeight: '500' as const },
} as const

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
    </Stack.Navigator>
  )
}

function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="HistoryMain" component={HistoryScreen} />
    </Stack.Navigator>
  )
}

function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  )
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="Generate"
        component={HomeStack}
        options={{
          tabBarLabel: 'Generate',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>✨</Text>
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryStack}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📋</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  )
}

function SplashScreen() {
  return (
    <View style={splashStyles.container}>
      <Text style={splashStyles.title}>Short Drama Studio</Text>
      <ActivityIndicator size="large" color="#6c63ff" style={splashStyles.spinner} />
    </View>
  )
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
  },
  spinner: {
    marginTop: 10,
  },
})

function AppContent() {
  const { isLoading } = useAuth()
  const [i18nReady, setI18nReady] = useState(false)

  useEffect(() => {
    loadLocale().then(() => setI18nReady(true))
  }, [])

  if (!i18nReady || isLoading) {
    return <SplashScreen />
  }

  return (
    <NavigationContainer>
      <MainTabs />
      <StatusBar style="light" />
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}