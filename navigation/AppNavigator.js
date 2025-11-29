import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import ManageMenuScreen from '../screens/ManageMenuScreen';
import AddMenuItemScreen from '../screens/AddMenuItemScreen';
import NewOrderScreen from '../screens/NewOrderScreen';
import OrderListScreen from '../screens/OrderListScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Açaiteria Mãe e Filha' }} />
                <Stack.Screen name="ManageMenu" component={ManageMenuScreen} options={{ title: 'Gerenciar Cardápio' }} />
                <Stack.Screen name="AddMenuItem" component={AddMenuItemScreen} options={{ title: 'Adicionar/Editar Item' }} />
                <Stack.Screen name="NewOrder" component={NewOrderScreen} options={{ title: 'Novo Pedido' }} />
                <Stack.Screen name="OrderList" component={OrderListScreen} options={{ title: 'Lista de Pedidos' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;