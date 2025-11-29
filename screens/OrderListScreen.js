import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getOrders, updateOrderStatus } from '../services/restaurantService';

const OrderListScreen = ({ route }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Aberto');

    const orderStatuses = ['Aberto', 'Em Preparo', 'Pronto', 'Pago', 'Cancelado'];

    const loadOrders = useCallback(async () => {
        setLoading(true);
        const allOrders = await getOrders();
        let filteredOrders = [];
        if (filter === 'Todos') {
            filteredOrders = allOrders;
        } else {
            filteredOrders = allOrders.filter(o => o.status === filter);
        }
        setOrders(filteredOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        setLoading(false);
    }, [filter]);

    useFocusEffect(
        useCallback(() => {
            loadOrders();
        }, [loadOrders, route.params?.refresh])
    );

    const handleChangeStatus = async (orderId, currentStatus) => {
        const currentIndex = orderStatuses.indexOf(currentStatus);
        let nextStatus = currentStatus;

        if (currentStatus !== 'Pago' && currentStatus !== 'Cancelado') {
            nextStatus = orderStatuses[(currentIndex + 1) % orderStatuses.length];
        } else {
            Alert.alert("Status Final", `O pedido já está ${currentStatus.toLowerCase()}.`);
            return;
        }

        Alert.alert(
            "Mudar Status do Pedido",
            `Mudar status de "${currentStatus}" para "${nextStatus}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: `Sim, para ${nextStatus}`, onPress: async () => {
                        try {
                            await updateOrderStatus(orderId, nextStatus);
                            loadOrders();
                        } catch (error) {
                            Alert.alert("Erro", "Não foi possível atualizar o status.");
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={[styles.itemContainer, styles[`status${item.status.replace(/\s+/g, '')}`]]}>
            <View style={styles.itemHeaderRow}>
                <Text style={styles.orderHeader}>Pedido #{item.id.slice(-5)}</Text>
                <Text style={styles.tableInfo}>Mesa/Cliente: {item.tableNumber}</Text>
            </View>
            <Text style={styles.orderTimestamp}>{new Date(item.timestamp).toLocaleString('pt-BR')}</Text>
            <View style={styles.orderItemsList}>
                {item.items.map(foodItem => (
                    <Text key={foodItem.menuItemId} style={styles.foodItem}>
                        {foodItem.quantity}x {foodItem.name} (R$ {foodItem.itemTotalPrice.toFixed(2)})
                    </Text>
                ))}
            </View>
            {item.notes ? <Text style={styles.orderNotes}>Obs: {item.notes}</Text> : null}
            <Text style={styles.orderTotal}>Total: R$ {item.totalOrderPrice.toFixed(2)}</Text>
            <View style={styles.statusActionRow}>
                <Text style={styles.orderStatusText}>Status: {item.status}</Text>
                {(item.status !== 'Pago' && item.status !== 'Cancelado') && (
                    <Button title={`Próximo Status`} onPress={() => handleChangeStatus(item.id, item.status)} color="#556B2F" />
                )}
            </View>
        </View>
    );

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#556B2F" /><Text>Carregando pedidos...</Text></View>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.filterContainer}>
                {['Aberto', 'Em Preparo', 'Pronto', 'Pago', 'Cancelado', 'Todos'].map(statusFilter => (
                    <TouchableOpacity
                        key={statusFilter}
                        style={[styles.filterButton, filter === statusFilter && styles.filterButtonActive]}
                        onPress={() => setFilter(statusFilter)}
                    >
                        <Text style={[styles.filterButtonText, filter === statusFilter && styles.filterButtonTextActive]}>{statusFilter}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {orders.length === 0 ? (
                <View style={styles.centered}><Text style={styles.emptyText}>Nenhum pedido encontrado para o filtro "{filter}".</Text></View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: '#F5F5DC' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    filterContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10, flexWrap: 'wrap' },
    filterButton: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 20, backgroundColor: '#E0E0E0', margin: 3 },
    filterButtonActive: { backgroundColor: '#8B4513' },
    filterButtonText: { color: '#333', fontSize: 12 },
    filterButtonTextActive: { color: 'white' },
    itemContainer: {
        backgroundColor: 'white',
        padding: 15,
        marginVertical: 8,
        borderRadius: 8,
        borderLeftWidth: 7,
        borderColor: 'gray',
        elevation: 2,
    },
    statusAberto: { borderColor: '#007bff' },
    statusEmPreparo: { borderColor: '#ffc107' },
    statusPronto: { borderColor: '#28a745' },
    statusPago: { borderColor: '#6c757d' },
    statusCancelado: { borderColor: '#dc3545', backgroundColor: '#fff0f1' },
    itemHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderHeader: { fontSize: 16, fontWeight: 'bold', color: '#556B2F' },
    tableInfo: { fontSize: 13, color: '#777' },
    orderTimestamp: { fontSize: 11, color: 'gray', marginBottom: 8 },
    orderItemsList: { marginVertical: 5, paddingLeft: 5, borderLeftWidth: 2, borderLeftColor: '#eee' },
    foodItem: { marginLeft: 5, fontStyle: 'italic', fontSize: 13, color: '#444', marginVertical: 1 },
    orderTotal: { fontSize: 16, fontWeight: 'bold', marginTop: 8, textAlign: 'right', color: '#8B4513' },
    orderNotes: { fontStyle: 'italic', color: '#777', marginTop: 5, marginBottom: 5, backgroundColor: '#f9f9f9', padding: 5, borderRadius: 3 },
    statusActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    orderStatusText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    emptyText: { textAlign: 'center', fontSize: 16, color: 'gray' }
});

export default OrderListScreen;