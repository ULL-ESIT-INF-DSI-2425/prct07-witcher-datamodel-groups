import { Transaction } from "../models/Transaction.js";
import { InventoryService } from "./InventoryService.js";
import { Item } from "../models/Item.js";
import { Merchant } from "../models/Merchant.js";
import { Customer } from "../models/Customer.js";
import { v4 as uuidv4 } from "uuid";

export class TransactionService {
  private transactions: Transaction[] = [];

  constructor(private inventory: InventoryService) {}

  processTransaction(transaction: Transaction): boolean {
    if (transaction.type === "sale" || transaction.type === "return") {
      for (const { item, quantity } of transaction.items) {
        if (!this.inventory.removeItem(item.id, quantity)) {
          console.log(`No hay suficiente stock para ${item.name}.`);
          return false;
        }
      }
    } else if (transaction.type === "purchase") {
      for (const { item, quantity } of transaction.items) {
        this.inventory.addItem(item, quantity);
      }
    }
    
    this.transactions.push(transaction);
    return true;
  }

  getTransactionHistory(): Transaction[] {
    return this.transactions;
  }

  getTransactionsHistoryByParticipant(participantId: string): Transaction[] {
    return this.transactions.filter(
      (tx) => tx.participant.id === participantId,
    );
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