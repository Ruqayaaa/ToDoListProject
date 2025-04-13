import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Start from './start'; // Adjust the path if necessary
import SignUpScreen from './signup';
import SignInScreen from './login';
import AddingToDoPage from './addToDo';
import ToDoList from './HomePage';
import TabBar from './TabBar';


const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
          <Stack.Navigator initialRouteName="Start">
          <Stack.Screen name="Start" component={Start} options={{ headerShown: false }} />
          <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SignInScreen" component={SignInScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ToDoList" component={ToDoList} options={{ headerShown: false }} />
          <Stack.Screen name="AddingToDoPage" component={AddingToDoPage} options={{ headerShown: false }} />
          <Stack.Screen name="TabBar" component={TabBar} options={{ headerShown: false }} />

    </Stack.Navigator>
  </NavigationContainer>
    
  );
};

export default App;