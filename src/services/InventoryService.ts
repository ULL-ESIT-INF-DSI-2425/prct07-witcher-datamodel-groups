import { Item } from "../models/Item.js";

export class InventoryService {
  private stock: Map<string, { item: Item; quantity: number }> = new Map();

  addItem(item: Item, quantity: number): void {
    if (this.stock.has(item.id)) {
      this.stock.get(item.id)!.quantity += quantity;
    } else {
      this.stock.set(item.id, { item, quantity });
    }
  }

  removeItem(itemId: string, quantity: number): boolean {
    if (!this.stock.has(itemId)) return false;
    
    const stockItem = this.stock.get(itemId)!;
    if (stockItem.quantity < quantity) return false;
    
    stockItem.quantity -= quantity;
    if (stockItem.quantity === 0) this.stock.delete(itemId);

    return true;
  }

  getStock(): { item: Item; quantity: number }[] {
    return Array.from(this.stock.values());
  }
}
