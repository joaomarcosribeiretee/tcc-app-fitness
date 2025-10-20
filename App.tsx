import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LoginScreen from "./src/presentation/auth/LoginScreen";
import RegisterScreen from "./src/presentation/auth/RegisterScreen";
import HomeScreen from "./src/presentation/home/HomeScreen";
import DietScreen from "./src/presentation/diet/DietScreen";
import ProfileScreen from "./src/presentation/profile/ProfileScreen";
import IntelligentWorkoutScreen from "./src/presentation/workout/IntelligentWorkoutScreen";
import WorkoutPlanScreen from "./src/presentation/workout/WorkoutPlanScreen";
import WorkoutDetailScreen from "./src/presentation/workout/WorkoutDetailScreen";
import { TabIcon, bottomTabBarStyles } from "./src/presentation/components/layout/BottomTabBar";
import { appHeaderOptions } from "./src/presentation/styles/appStyles";
import { useAppFonts } from "./src/presentation/styles/fonts";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


// Navegação principal com tabs
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: bottomTabBarStyles.tabBar,
      })}
    >
      <Tab.Screen name="Workout" component={HomeScreen} options={{ tabBarLabel: '' }} />
      <Tab.Screen name="Diet" component={DietScreen} options={{ tabBarLabel: '' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: '' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          gestureEnabled: false, // Desabilita gestos de voltar
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{
            ...appHeaderOptions,
            headerLeft: () => null, // Remove botão de voltar
          }} 
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            ...appHeaderOptions,
            headerLeft: () => null, // Remove botão de voltar
          }}
        />
        <Stack.Screen 
          name="Main" 
          component={MainTabs} 
          options={{ 
            headerShown: false,
            headerLeft: () => null, // Remove botão de voltar
          }} 
        />
        <Stack.Screen 
          name="IntelligentWorkout" 
          component={IntelligentWorkoutScreen} 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="WorkoutPlan" 
          component={WorkoutPlanScreen} 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="WorkoutDetail" 
          component={WorkoutDetailScreen} 
          options={{ 
            headerShown: false,
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
