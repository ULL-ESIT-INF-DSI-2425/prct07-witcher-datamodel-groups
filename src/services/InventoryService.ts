import { Item } from "../models/Item.js";
import { Customer } from "../models/Customer.js";
import { Merchant } from "../models/Merchant.js";
import { Schema } from "../database/schema.js";
import { db } from "../database/coleccion.js";

/**
 * Servicio encargado de gestionar el inventario, clientes y comerciantes.
 */
export class InventoryService {
  private stock: { item: Item; quantity: number }[] = [];
  private customers: Customer[] = [];
  private merchants: Merchant[] = [];

  /**
   * Crea una instancia del servicio de inventario y carga los datos iniciales.
   */
  constructor() {
    this.loadInitialData();
  }

  /**
   * Carga los datos iniciales desde la base de datos.
   */
  private loadInitialData(): void {
    db.data?.bienes.forEach((itemData) => {
      const item = new Item(
        itemData.id,
        itemData.name,
        itemData.description,
        itemData.material,
        itemData.weight,
        itemData.value,
      );
      this.addItem(item, 1);
    });

    this.customers = db.data?.clientes || [];
    this.merchants = db.data?.mercaderes || [];
  }

  /**
   * Agrega un ítem al inventario o aumenta su cantidad si ya existe.
   * @param item - El ítem a agregar.
   * @param quantity - La cantidad a agregar.
   */
  addItem(item: Item, quantity: number): void {
    const existingItem = this.stock.find((entry) => entry.item.id === item.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.stock.push({ item, quantity });
    }
  }

  /**
   * Remueve una cantidad específica de un ítem del inventario.
   * @param itemId - ID del ítem a remover.
   * @param quantity - Cantidad a remover.
   * @returns `true` si se removió correctamente, `false` si no hay suficiente stock.
   */
  removeItem(itemId: string, quantity: number): boolean {
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

  /**
   * Agrega un cliente a la lista de clientes.
   * @param customer - Cliente a agregar.
   */
  addCustomer(customer: Customer): void {
    this.customers.push(customer);
  }

  /**
   * Agrega un comerciante a la lista de comerciantes.
   * @param merchant - Comerciante a agregar.
   */
  addMerchant(merchant: Merchant): void {
    this.merchants.push(merchant);
  }

  /**
   * Elimina un cliente de la lista.
   * @param customerId - ID del cliente a eliminar.
   * @returns `true` si se eliminó correctamente, `false` si no se encontró.
   */
  removeCustomer(customerId: string): boolean {
    const customerIndex = this.customers.findIndex(
      (customer) => customer.id === customerId,
    );
    if (customerIndex === -1) return false;

    this.customers.splice(customerIndex, 1);
    return true;
  }

  /**
   * Elimina un comerciante de la lista.
   * @param merchantId - ID del comerciante a eliminar.
   * @returns `true` si se eliminó correctamente, `false` si no se encontró.
   */
  removeMerchant(merchantId: string): boolean {
    const merchantIndex = this.merchants.findIndex(
      (merchant) => merchant.id === merchantId,
    );
    if (merchantIndex === -1) return false;

    this.merchants.splice(merchantIndex, 1);
    return true;
  }

  /**
   * Obtiene el stock actual del inventario.
   * @returns Un arreglo con los ítems y sus cantidades.
   */
  getStock(): { item: Item; quantity: number }[] {
    return this.stock;
  }

  /**
   * Obtiene la lista de clientes registrados.
   * @returns Un arreglo con los clientes.
   */
  getCustomers(): Customer[] {
    return this.customers;
  }

  /**
   * Obtiene la lista de comerciantes registrados.
   * @returns Un arreglo con los comerciantes.
   */
  getMerchants(): Merchant[] {
    return this.merchants;
  }
}
