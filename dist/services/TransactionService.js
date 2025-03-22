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
        this.transactions.push(new Transaction(`tx-${Date.now()}`, new Date(), items.map((i) => i.item), totalAmount, participant, type));
        console.log(`Transacción completada: ${type} por ${totalAmount} coronas.`);
        return true;
    }
    getTransactionHistory() {
        return this.transactions;
    }
    // Calcular total de ingresos por ventas
    getTotalIncome() {
        return this.transactions
            .filter((tx) => tx.type === "sale")
            .reduce((total, tx) => total + tx.totalAmount, 0);
    }
    // Calcular total de gastos por compras
    getTotalExpenses() {
        return this.transactions
            .filter((tx) => tx.type === "purchase")
            .reduce((total, tx) => total + tx.totalAmount, 0);
    }
    // Generar informe de bienes más vendidos
    getTopSoldItems(limit = 5) {
        const itemSales = new Map();
        this.transactions
            .filter((tx) => tx.type === "sale")
            .forEach((tx) => {
            tx.items.forEach((item) => {
                if (itemSales.has(item.id)) {
                    itemSales.get(item.id).quantity += 1;
                }
                else {
                    itemSales.set(item.id, { item, quantity: 1 });
                }
            });
        });
        return Array.from(itemSales.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, limit);
    }
    getTransactionsHistoryByParticipant(participantId) {
        return this.transactions.filter((tx) => tx.participant.id === participantId);
    }
}
