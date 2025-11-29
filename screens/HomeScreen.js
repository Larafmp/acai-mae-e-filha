import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';

const HomeScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Açaiteria</Text>
            <Text style={styles.subtitle}>Mãe e Filha</Text>
            <View style={styles.buttonContainer}>
                <Button
                    title="Novo Pedido"
                    onPress={() => navigation.navigate('NewOrder')}
                    color="#c8e622ff"
                />
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    title="Gerenciar Cardápio"
                    onPress={() => navigation.navigate('ManageMenu')}
                    color="#861273ff"
                />
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    title="Ver Pedidos"
                    onPress={() => navigation.navigate('OrderList')}
                    color="#0ca54cff"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#F5F5DC',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#8B4513',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#A0522D',
        marginBottom: 40,
    },
    buttonContainer: {
        width: '80%',
        marginVertical: 10,
    }
});

export default HomeScreen;