import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMenuItems, recordNewOrder } from '../services/restaurantService';

const NewOrderScreen = ({ navigation }) => {
    const [availableMenuItems, setAvailableMenuItems] = useState([]);
    const [currentOrderItems, setCurrentOrderItems] = useState([]);
    const [totalOrderPrice, setTotalOrderPrice] = useState(0);
    const [tableNumber, setTableNumber] = useState('');
    const [notes, setNotes] = useState('');

    const loadMenu = useCallback(async () => {
        const allItems = await getMenuItems();
        setAvailableMenuItems(allItems.filter(item => item.availability === 'Disponível').sort((a, b) => a.name.localeCompare(b.name)));
    }, []);

    useFocusEffect(loadMenu);

    useEffect(() => {
        const total = currentOrderItems.reduce((sum, item) => sum + item.itemTotalPrice, 0);
        setTotalOrderPrice(total);
    }, [currentOrderItems]);

    const addItemToOrder = (menuItem) => {
        const existingItemIndex = currentOrderItems.findIndex(item => item.menuItemId === menuItem.id);
        let newOrderItems;

        if (existingItemIndex > -1) {
            newOrderItems = currentOrderItems.map((item, index) =>
                index === existingItemIndex
                    ? { ...item, quantity: item.quantity + 1, itemTotalPrice: (item.quantity + 1) * item.unitPrice }
                    : item
            );
        } else {
            newOrderItems = [
                ...currentOrderItems,
                {
                    menuItemId: menuItem.id,
                    name: menuItem.name,
                    quantity: 1,
                    unitPrice: menuItem.price,
                    itemTotalPrice: menuItem.price * 1,
                },
            ];
        }
        setCurrentOrderItems(newOrderItems);
    };

    const updateQuantityInOrder = (menuItemId, change) => {
        setCurrentOrderItems(currentOrderItems.map(item => {
            if (item.menuItemId === menuItemId) {
                const newQuantity = item.quantity + change;
                if (newQuantity > 0) {
                    return { ...item, quantity: newQuantity, itemTotalPrice: newQuantity * item.unitPrice };
                }
                return null;
            }
            return item;
        }).filter(item => item !== null));
    };

    const handleFinalizeOrder = async () => {
        if (currentOrderItems.length === 0) {
            Alert.alert('Pedido Vazio', 'Adicione itens ao pedido antes de finalizar.');
            return;
        }
        const orderData = {
            items: currentOrderItems,
            totalOrderPrice,
            tableNumber: tableNumber.trim() || 'Balcão',
            notes: notes.trim(),
        };
        try {
            await recordNewOrder(orderData);
            Alert.alert('Sucesso', 'Pedido registrado!');
            setCurrentOrderItems([]);
            setTableNumber('');
            setNotes('');
            navigation.navigate('OrderList', { refresh: true });
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível registrar o pedido.');
        }
    };

    const MenuItemCard = ({ item, onAddToOrder }) => (
        <TouchableOpacity onPress={() => onAddToOrder(item)} style={styles.menuItemCard}>
            <Text style={styles.menuItemName}>{item.name}</Text>
            <Text style={styles.menuItemPrice}>R$ {item.price.toFixed(2)}</Text>
        </TouchableOpacity>
    );

    const CurrentOrderItemCard = ({ item, onUpdateQuantity }) => (
        <View style={styles.currentOrderItem}>
            <View style={styles.currentOrderItemInfo}>
                <Text style={styles.currentOrderItemText}>{item.name}</Text>
                <Text style={styles.currentOrderItemSubText}>R$ {item.itemTotalPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.quantityControls}>
                <TouchableOpacity onPress={() => onUpdateQuantity(item.menuItemId, -1)} style={styles.quantityButton}><Text style={styles.quantityButtonText}>-</Text></TouchableOpacity>
                <Text style={styles.quantityDisplay}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => onUpdateQuantity(item.menuItemId, 1)} style={styles.quantityButton}><Text style={styles.quantityButtonText}>+</Text></TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.scrollViewContainer}>
            <View style={styles.container}>
                <Text style={styles.header}>Cardápio Disponível:</Text>
                <View style={styles.menuListContainer}>
                    {availableMenuItems.length === 0 && <Text>Nenhum item disponível no cardápio.</Text>}
                    {availableMenuItems.map(item => <MenuItemCard key={item.id} item={item} onAddToOrder={addItemToOrder} />)}
                </View>

                <Text style={styles.header}>Pedido Atual:</Text>
                {currentOrderItems.length === 0 && <Text style={styles.emptyOrderText}>Seu pedido está vazio.</Text>}
                {currentOrderItems.map(item => <CurrentOrderItemCard key={item.menuItemId} item={item} onUpdateQuantity={updateQuantityInOrder} />)}

                <Text style={styles.totalText}>Total do Pedido: R$ {totalOrderPrice.toFixed(2)}</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Nº da Mesa / Cliente (Opcional)"
                    value={tableNumber}
                    onChangeText={setTableNumber}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Observações (Opcional)"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                />
                <View style={styles.finalizeButtonContainer}>
                    <Button title="Finalizar Pedido" onPress={handleFinalizeOrder} color="#006400" disabled={currentOrderItems.length === 0} />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollViewContainer: { flex: 1, backgroundColor: '#F5F5DC' },
    container: { padding: 15 },
    header: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#556B2F' },
    menuListContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    menuItemCard: {
        backgroundColor: '#FFF8DC',
        padding: 10,
        marginVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#A0522D',
        width: '48%',
        alignItems: 'center',
        elevation: 1,
    },
    menuItemName: { color: '#8B4513', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
    menuItemPrice: { color: '#556B2F', fontSize: 13, textAlign: 'center' },
    currentOrderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: 'white',
        borderRadius: 5,
        marginBottom: 5,
    },
    currentOrderItemInfo: { flex: 3 },
    currentOrderItemText: { fontSize: 15, color: '#333' },
    currentOrderItemSubText: { fontSize: 13, color: '#777' },
    quantityControls: { flexDirection: 'row', alignItems: 'center', flex: 2, justifyContent: 'flex-end' },
    quantityButton: { backgroundColor: '#D2B48C', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginHorizontal: 5 },
    quantityButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    quantityDisplay: { fontSize: 16, fontWeight: 'bold', minWidth: 25, textAlign: 'center' },
    emptyOrderText: { textAlign: 'center', marginVertical: 10, color: 'gray' },
    totalText: { fontSize: 20, fontWeight: 'bold', textAlign: 'right', marginVertical: 15, color: '#8B4513' },
    input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#A0522D', padding: 10, marginBottom: 10, borderRadius: 5 },
    finalizeButtonContainer: { marginTop: 10, marginBottom: 30 }
});

export default NewOrderScreen;