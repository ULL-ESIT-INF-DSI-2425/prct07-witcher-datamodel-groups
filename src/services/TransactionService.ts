import { Transaction } from "../models/Transaction.js";
import { InventoryService } from "./InventoryService.js";
import { Merchant } from "../models/Merchant.js";
import { Customer } from "../models/Customer.js";
import { Item } from "../models/Item.js";

export class TransactionService {
  private transactions: Transaction[] = [];

  constructor(private inventory: InventoryService) {}

  processTransaction(
    participant: Merchant | Customer,
    items: { item: Item; quantity: number }[],
    type: "purchase" | "sale" | "return",
  ): boolean {
    let totalAmount = 0;

    if (type === "sale" || type === "return") {
      for (const { item, quantity } of items) {
        if (!this.inventory.removeItem(item.id, quantity)) {
          console.log(`Stock insuficiente para ${item.name}`);
          return false;
        }
        totalAmount += item.value * quantity;
      }
    } else {
      for (const { item, quantity } of items) {
        this.inventory.addItem(item, quantity);
        totalAmount += item.value * quantity;
      }
    }

    this.transactions.push(
      new Transaction(
        `tx-${Date.now()}`,
        new Date(),
        items, 
        totalAmount,
        participant,
        type,
      ),
    );
    

    console.log(`Transacción completada: ${type} por ${totalAmount} coronas.`);
    return true;
  }

  getTransactionHistory(): Transaction[] {
    return this.transactions;
  }

  // Calcular total de ingresos por ventas
  getTotalIncome(): number {
    return this.transactions
      .filter((tx) => tx.type === "sale")
      .reduce((total, tx) => total + tx.totalAmount, 0);
  }

  // Calcular total de gastos por compras
  getTotalExpenses(): number {
    return this.transactions
      .filter((tx) => tx.type === "purchase")
      .reduce((total, tx) => total + tx.totalAmount, 0);
  }

  // Generar informe de bienes más vendidos
  getTopSoldItems(limit: number = 5): { item: Item; quantity: number }[] {
    const itemSales: Map<string, { item: Item; quantity: number }> = new Map();

    this.transactions
      .filter((tx) => tx.type === "sale")
      .forEach((tx) => {
        tx.items.forEach(({ item, quantity }) => {
  if (itemSales.has(item.id)) {
    itemSales.get(item.id)!.quantity += quantity;
  } else {
    itemSales.set(item.id, { item, quantity });
  }
});

      });

    return Array.from(itemSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  }

  getTransactionsHistoryByParticipant(participantId: string): Transaction[] {
    return this.transactions.filter(
      (tx) => tx.participant.id === participantId,
    );
  }

  removeTransaction(transactionId: string): boolean {
    const transactionIndex = this.transactions.findIndex(
      (tx) => tx.id === transactionId,
    );
    if (transactionIndex === -1) return false;

    const transaction = this.transactions[transactionIndex];
    if (transaction.type === "sale" || transaction.type === "return") {
      transaction.items.forEach(({ item, quantity }) => {
        this.inventory.addItem(item, quantity); // ← Añadir la cantidad original
      });
    } else {
      transaction.items.forEach(({ item, quantity }) => {
        this.inventory.removeItem(item.id, quantity); // ← Eliminar correctamente
      });
    }
    

    this.transactions.splice(transactionIndex, 1);
    return true;
  }
}
