import { Item } from "../models/Item.js";
import { db } from "../coleccion/coleccion.js"; // Importar la base de datos
export class InventoryService {
    stock = [];
    customers = [];
    merchants = [];
    constructor() {
        this.loadInitialData();
    }
    // Cargar datos iniciales desde la base de datos
    loadInitialData() {
        // Cargar bienes
        db.data?.bienes.forEach((itemData) => {
            const item = new Item(itemData.id, itemData.name, itemData.description, itemData.material, itemData.weight, itemData.value);
            this.addItem(item, 1); // Añadir 1 unidad de cada bien por defecto
        });
        // Cargar clientes
        this.customers = db.data?.clientes || [];
        // Cargar mercaderes
        this.merchants = db.data?.mercaderes || [];
    }
    addItem(item, quantity) {
        const existingItem = this.stock.find((entry) => entry.item.id === item.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        }
        else {
            this.stock.push({ item, quantity });
        }
    }
    removeItem(itemId, quantity) {
        const existingItem = this.stock.find((entry) => entry.item.id === itemId);
        if (existingItem && existingItem.quantity >= quantity) {
            existingItem.quantity -= quantity;
            if (existingItem.quantity === 0) {
                this.stock = this.stock.filter((entry) => entry.item.id !== itemId);
            }
            return true;
        }
        return false;
    }
    addCustomer(customer) {
        this.customers.push(customer);
    }
    addMerchant(merchant) {
        this.merchants.push(merchant);
    }
    removeCustomer(customerId) {
        const customerIndex = this.customers.findIndex((customer) => customer.id === customerId);
        if (customerIndex === -1)
            return false;
        this.customers.splice(customerIndex, 1);
        return true;
    }
    removeMerchant(merchantId) {
        const merchantIndex = this.merchants.findIndex((merchant) => merchant.id === merchantId);
        if (merchantIndex === -1)
            return false;
        this.merchants.splice(merchantIndex, 1);
        return true;
    }
    getStock() {
        return this.stock;
    }
    // Obtener clientes
    getCustomers() {
        return this.customers;
    }
    // Obtener mercaderes
    getMerchants() {
        return this.merchants;
    }
}
