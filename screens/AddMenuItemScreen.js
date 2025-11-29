import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Switch, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { addMenuItem, updateMenuItem } from '../services/restaurantService';

const AddMenuItemScreen = ({ route, navigation }) => {
    const { itemToEdit } = route.params || {};

    const [name, setName] = useState(itemToEdit?.name || '');
    const [description, setDescription] = useState(itemToEdit?.description || '');
    const [price, setPrice] = useState(itemToEdit?.price?.toString() || '');
    const [category, setCategory] = useState(itemToEdit?.category || '');
    const [isSpecial, setIsSpecial] = useState(itemToEdit?.isSpecial || false);
    const [availability, setAvailability] = useState(itemToEdit?.availability || 'Disponível');

    const categories = ['P', 'M', 'G', 'GG'];
    const availabilityOptions = ['Disponível', 'Indisponível'];

    const handleSaveItem = async () => {
        if (!name || !price) {
            Alert.alert('Erro', 'Nome e Preço são obrigatórios.');
            return;
        }
        const numericPrice = parseFloat(price.replace(',', '.'));
        if (isNaN(numericPrice) || numericPrice <= 0) {
            Alert.alert('Erro', 'Preço inválido.');
            return;
        }

        const menuItemData = {
            id: itemToEdit?.id,
            name,
            description,
            price: numericPrice,
            category,
            isSpecial,
            availability,
        };

        try {
            if (itemToEdit) {
                await updateMenuItem(menuItemData);
                Alert.alert('Sucesso', 'Item atualizado!');
            } else {
                await addMenuItem(menuItemData);
                Alert.alert('Sucesso', 'Item adicionado ao cardápio!');
            }
            navigation.goBack();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar o item.');
            console.error(error);
        }
    };

    return (
        <ScrollView style={styles.scrollViewContainer}>
            <View style={styles.container}>
                <Text style={styles.label}>Nome do Item:</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ex: Açaí" />

                <Text style={styles.label}>Descrição (opcional):</Text>
                <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Ex: Granola, leite em pó..." multiline />

                <Text style={styles.label}>Preço (R$):</Text>
                <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="Ex: 35.50" />

                <Text style={styles.label}>Categoria:</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={category}
                        onValueChange={(itemValue) => setCategory(itemValue)}
                        style={styles.picker}
                    >
                        {categories.map(cat => <Picker.Item key={cat} label={cat} value={cat} />)}
                    </Picker>
                </View>

                <View style={styles.switchContainer}>
                    <Text style={styles.label}>É Especial do Dia?</Text>
                    <Switch value={isSpecial} onValueChange={setIsSpecial} trackColor={{ false: "#767577", true: "#019201ff" }} thumbColor={isSpecial ? "#f4f3f4" : "#f4f3f4"} />
                </View>

                <Text style={styles.label}>Disponibilidade:</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={availability}
                        onValueChange={(itemValue) => setAvailability(itemValue)}
                        style={styles.picker}
                    >
                        {availabilityOptions.map(opt => <Picker.Item key={opt} label={opt} value={opt} />)}
                    </Picker>
                </View>

                <View style={styles.buttonView}>
                    <Button title={itemToEdit ? "Atualizar Item" : "Adicionar Item"} onPress={handleSaveItem} color="#006400" />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollViewContainer: { flex: 1, backgroundColor: '#F5F5DC' },
    container: { padding: 20 },
    label: { fontSize: 16, color: '#556B2F', marginBottom: 5, marginTop: 10 },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#A0522D',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#A0522D',
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: 'white',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingHorizontal: 5,
    },
    buttonView: {
        marginTop: 20,
    }
});

export default AddMenuItemScreen;