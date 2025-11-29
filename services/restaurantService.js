// services/restaurantService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const MENU_ITEMS_KEY = '@MaeEFilha:menuItems';
const ORDERS_KEY = '@MaeEFilha:orders';

// --- Funções do Cardápio (Menu Items) ---
export const getMenuItems = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(MENU_ITEMS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Erro ao buscar itens do cardápio", e);
    return [];
  }
};

export const saveMenuItems = async (menuItems) => {
  try {
    const jsonValue = JSON.stringify(menuItems);
    await AsyncStorage.setItem(MENU_ITEMS_KEY, jsonValue);
  } catch (e) {
    console.error("Erro ao salvar itens do cardápio", e);
  }
};

export const addMenuItem = async (newItem) => {
  const items = await getMenuItems();
  const fullItem = {
    ...newItem,
    id: Date.now().toString(),
    category: newItem.category || '',
    isSpecial: newItem.isSpecial || false,
    availability: newItem.availability || 'Disponível',
  };
  items.push(fullItem);
  await saveMenuItems(items);
  return fullItem;
};

export const updateMenuItem = async (updatedItem) => {
  let items = await getMenuItems();
  items = items.map(item => (item.id === updatedItem.id ? updatedItem : item));
  await saveMenuItems(items);
};

export const deleteMenuItem = async (itemId) => {
  let items = await getMenuItems();
  items = items.filter(item => item.id !== itemId);
  await saveMenuItems(items);
};

// --- Funções de Pedidos (Orders) ---
export const getOrders = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(ORDERS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Erro ao buscar pedidos", e);
    return [];
  }
};

export const saveOrders = async (orders) => {
  try {
    const jsonValue = JSON.stringify(orders);
    await AsyncStorage.setItem(ORDERS_KEY, jsonValue);
  } catch (e) {
    console.error("Erro ao salvar pedidos", e);
  }
};

export const recordNewOrder = async (orderData) => {
  const orders = await getOrders();
  const newOrder = {
    id: Date.now().toString(),
    items: orderData.items,
    totalOrderPrice: orderData.totalOrderPrice,
    tableNumber: orderData.tableNumber || 'Balcão',
    status: 'Aberto',
    timestamp: new Date().toISOString(),
    notes: orderData.notes || '',
  };
  orders.push(newOrder);
  await saveOrders(orders);
  return newOrder;
};

export const updateOrderStatus = async (orderId, newStatus) => {
  let orders = await getOrders();
  orders = orders.map(order =>
    order.id === orderId ? { ...order, status: newStatus } : order
  );
  await saveOrders(orders);
};