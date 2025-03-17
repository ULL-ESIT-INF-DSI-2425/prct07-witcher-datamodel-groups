export class InventoryService {
    stock = new Map();
    addItem(item, quantity) {
        if (this.stock.has(item.id)) {
            this.stock.get(item.id).quantity += quantity;
        }
        else {
            this.stock.set(item.id, { item, quantity });
        }
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
    getStock() {
        return Array.from(this.stock.values());
    }
}
