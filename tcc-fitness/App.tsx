import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/presentation/auth/LoginScreen";
import RegisterScreen from "./src/presentation/auth/RegisterScreen";
import { View, Text } from "react-native";

const Stack = createNativeStackNavigator();

function Home() {
  return (
    <View style={{flex:1,alignItems:"center",justifyContent:"center"}}>
      <Text>Bem-vindo! (Home)</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
