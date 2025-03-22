import { Item } from "../models/Item.js";
import { Customer } from "../models/Customer.js";
import { Merchant } from "../models/Merchant.js";
import { Schema } from "../coleccion/schema.js"; // Importar la base de datos
import { db } from "../coleccion/coleccion.js"; // Importar la base de datos

export class InventoryService {
  private stock: Map<string, { item: Item; quantity: number }> = new Map();
  private customers: Customer[] = [];
  private merchants: Merchant[] = [];

  constructor() {
    this.loadInitialData();
  }

  // Cargar datos iniciales desde la base de datos
  private loadInitialData(): void {
    // Cargar bienes
    db.data?.bienes.forEach((itemData) => {
      const item = new Item(
        itemData.id,
        itemData.name,
        itemData.description,
        itemData.material,
        itemData.weight,
        itemData.value,
      );
      this.addItem(item, 1); // Añadir 1 unidad de cada bien por defecto
    });
    // Cargar clientes
    this.customers = db.data?.clientes || [];

    // Cargar mercaderes
    this.merchants = db.data?.mercaderes || [];
  }

  addItem(item: Item, quantity: number): void {
    if (this.stock.has(item.id)) {
      this.stock.get(item.id)!.quantity += quantity;
    } else {
      this.stock.set(item.id, { item, quantity });
    }
  }

  addCustomer(customer: Customer): void {
    this.customers.push(customer);
  }

  addMerchant(merchant: Merchant): void {
    this.merchants.push(merchant);
  }

  removeItem(itemId: string, quantity: number): boolean {
    if (!this.stock.has(itemId)) return false;

    const stockItem = this.stock.get(itemId)!;
    if (stockItem.quantity < quantity) return false;

    stockItem.quantity -= quantity;
    if (stockItem.quantity === 0) this.stock.delete(itemId);

    return true;
  }

  removeCustomer(customerId: string): boolean {
    const customerIndex = this.customers.findIndex(
      (customer) => customer.id === customerId,
    );
    if (customerIndex === -1) return false;

    this.customers.splice(customerIndex, 1);
    return true;
  }

  removeMerchant(merchantId: string): boolean {
    const merchantIndex = this.merchants.findIndex(
      (merchant) => merchant.id === merchantId,
    );
    if (merchantIndex === -1) return false;

    this.merchants.splice(merchantIndex, 1);
    return true;
  }

  getStock(): { item: Item; quantity: number }[] {
    return Array.from(this.stock.values());
  }
  // Obtener clientes
  getCustomers(): Customer[] {
    return this.customers;
  }

  // Obtener mercaderes
  getMerchants(): Merchant[] {
    return this.merchants;
  }
}
