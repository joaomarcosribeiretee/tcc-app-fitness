import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/presentation/auth/LoginScreen";
import RegisterScreen from "./src/presentation/auth/RegisterScreen";
import HomeScreen from "./src/presentation/home/HomeScreen";
import { View, Text } from "react-native";
import { appHeaderOptions, screenStyles } from "./src/presentation/auth/styles/appStyles";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={appHeaderOptions} />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={appHeaderOptions}
        />
        <Stack.Screen name="Home" component={HomeScreen} options={appHeaderOptions} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
