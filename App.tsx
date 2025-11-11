import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LoginScreen from "./src/presentation/auth/LoginScreen";
import RegisterScreen from "./src/presentation/auth/RegisterScreen";
import HomeScreen from "./src/presentation/home/HomeScreen";
import DietScreen from "./src/presentation/diet/DietScreen";
import ProfileScreen from "./src/presentation/profile/ProfileScreen";
import IntelligentWorkoutScreen from "./src/presentation/workout/IntelligentWorkoutScreen";
import IntelligentDietScreen from "./src/presentation/diet/IntelligentDietScreen";
import WorkoutPlanScreen from "./src/presentation/workout/WorkoutPlanScreen";
import DietPlanScreen from "./src/presentation/diet/DietPlanScreen";
import DietAdjustmentsScreen from "./src/presentation/diet/DietAdjustmentsScreen";
import WorkoutDetailScreen from "./src/presentation/workout/WorkoutDetailScreen";
import WorkoutAdjustmentsScreen from "./src/presentation/workout/WorkoutAdjustmentsScreen";
import WorkoutExecutionScreen from "./src/presentation/workout/WorkoutExecutionScreen";
import WorkoutSummaryScreen from "./src/presentation/workout/WorkoutSummaryScreen";
import WorkoutDetailsScreen from "./src/presentation/workout/WorkoutDetailsScreen";
import { TabIcon, bottomTabBarStyles } from "./src/presentation/components/layout/BottomTabBar";
import { appHeaderOptions } from "./src/presentation/styles/appStyles";
import { useAppFonts } from "./src/presentation/styles/fonts";
import * as secure from "./src/infra/secureStore";
import { isJwtValid } from "./src/utils/jwt";

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
  const [isChecking, setIsChecking] = useState(true);
  const [initialRoute, setInitialRoute] = useState<string>('Login');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await secure.getItem('auth_token');
        if (token && isJwtValid(token)) {
          setInitialRoute('Main');
        } else {
          // Token inválido ou expirado
          if (token) {
            await secure.deleteItem('auth_token');
          }
          setInitialRoute('Login');
        }
      } catch (error) {
        setInitialRoute('Login');
      } finally {
        setIsChecking(false);
      }
    };

    if (fontsLoaded) {
      checkAuth();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator 
        initialRouteName={initialRoute}
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
          name="IntelligentDiet" 
          component={IntelligentDietScreen} 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="DietPlan" 
          component={DietPlanScreen} 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="DietAdjustments" 
          component={DietAdjustmentsScreen} 
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
        <Stack.Screen 
          name="WorkoutAdjustments" 
          component={WorkoutAdjustmentsScreen} 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="WorkoutExecution" 
          component={WorkoutExecutionScreen} 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="WorkoutSummary" 
          component={WorkoutSummaryScreen as any} 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="WorkoutDetails" 
          component={WorkoutDetailsScreen as any} 
          options={{ 
            headerShown: false,
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}
