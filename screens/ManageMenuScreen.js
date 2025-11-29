import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMenuItems, deleteMenuItem } from '../services/restaurantService';

const ManageMenuScreen = ({ navigation }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadMenu = useCallback(async () => {
        setLoading(true);
        const data = await getMenuItems();
        setMenuItems(data.sort((a, b) => a.name.localeCompare(b.name)));
        setLoading(false);
    }, []);

    useFocusEffect(loadMenu);

    const confirmDelete = (item) => {
        Alert.alert(
            "Confirmar Exclusão",
            `Tem certeza que deseja excluir "${item.name}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Excluir", onPress: () => handleDelete(item.id), style: "destructive" }
            ]
        );
    };

    const handleDelete = async (itemId) => {
        try {
            await deleteMenuItem(itemId);
            loadMenu();
        } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir o item.");
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.itemTextContainer}>
                <Text style={styles.itemName}>{item.name} <Text style={styles.itemCategory}>({item.category})</Text></Text>
                <Text style={styles.itemPrice}>R$ {item.price.toFixed(2)}</Text>
                <Text style={item.availability === 'Disponível' ? styles.available : styles.unavailable}>
                    {item.availability} {item.isSpecial ? '(Especial!)' : ''}
                </Text>
            </View>
            <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => navigation.navigate('AddMenuItem', { itemToEdit: item })} style={[styles.actionButton, styles.editButton]}>
                    <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(item)} style={[styles.actionButton, styles.deleteButton]}>
                    <Text style={styles.actionButtonText}>X</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#556B2F" /><Text>Carregando cardápio...</Text></View>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.buttonView}>
                <Button
                    title="Adicionar Novo Item ao Cardápio"
                    onPress={() => navigation.navigate('AddMenuItem')}
                    color="#006400"
                />
            </View>
            {menuItems.length === 0 ? (
                <View style={styles.centered}><Text style={styles.emptyText}>Nenhum item no cardápio. Adicione alguns!</Text></View>
            ) : (
                <FlatList
                    data={menuItems}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    style={styles.list}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: '#F5F5DC' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    buttonView: { marginBottom: 15 },
    list: { marginTop: 5 },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        marginVertical: 8,
        borderRadius: 8,
        borderColor: '#A0522D',
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    itemTextContainer: { flex: 1, marginRight: 10 },
    itemName: { fontSize: 18, fontWeight: 'bold', color: '#556B2F' },
    itemCategory: { fontSize: 12, fontStyle: 'italic', color: 'gray' },
    itemPrice: { fontSize: 16, color: '#8B4513', marginVertical: 2 },
    available: { fontSize: 14, color: 'green', fontWeight: 'bold' },
    unavailable: { fontSize: 14, color: 'red', fontWeight: 'bold' },
    itemActions: { flexDirection: 'column', justifyContent: 'space-between' },
    actionButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 5, alignItems: 'center', minWidth: 60, marginVertical: 3 },
    editButton: { backgroundColor: '#556B2F' },
    deleteButton: { backgroundColor: '#dc3545' },
    actionButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    emptyText: { textAlign: 'center', fontSize: 16, color: 'gray' }
});

export default ManageMenuScreen;