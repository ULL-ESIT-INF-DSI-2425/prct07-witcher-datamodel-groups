import { Item } from "../models/Item.js";
import { db } from "../coleccion/coleccion.js"; // Importar la base de datos
export class InventoryService {
    stock = new Map();
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
        if (this.stock.has(item.id)) {
            this.stock.get(item.id).quantity += quantity;
        }
        else {
            this.stock.set(item.id, { item, quantity });
        }
    }
    addCustomer(customer) {
        this.customers.push(customer);
    }
    addMerchant(merchant) {
        this.merchants.push(merchant);
    }
    removeItem(itemId, quantity) {
        if (!this.stock.has(itemId))
            return false;
        const stockItem = this.stock.get(itemId);
        if (stockItem.quantity < quantity)
            return false;
        stockItem.quantity -= quantity;
        if (stockItem.quantity === 0)
            this.stock.delete(itemId);
        return true;
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
        return Array.from(this.stock.values());
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
