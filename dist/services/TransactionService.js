import { Transaction } from "../models/Transaction.js";
export class TransactionService {
    inventory;
    transactions = [];
    constructor(inventory) {
        this.inventory = inventory;
    }
    processTransaction(participant, items, type) {
        let totalAmount = 0;
        if (type === "sale" || type === "return") {
            for (const { item, quantity } of items) {
                if (!this.inventory.removeItem(item.id, quantity)) {
                    console.log(`Stock insuficiente para ${item.name}`);
                    return false;
                }
                totalAmount += item.value * quantity;
            }
        }
        else {
            for (const { item, quantity } of items) {
                this.inventory.addItem(item, quantity);
                totalAmount += item.value * quantity;
            }
        }
        this.transactions.push(new Transaction(`tx-${Date.now()}`, new Date(), items.map(i => i.item), totalAmount, participant, type));
        console.log(`Transacción completada: ${type} por ${totalAmount} coronas.`);
        return true;
    }
    getTransactionHistory() {
        return this.transactions;
    }
}
