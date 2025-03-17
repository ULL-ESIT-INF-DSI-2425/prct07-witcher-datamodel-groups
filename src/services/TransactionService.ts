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
    type: "purchase" | "sale" | "return"
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
        items.map(i => i.item),
        totalAmount,
        participant,
        type
      )
    );

    console.log(`Transacción completada: ${type} por ${totalAmount} coronas.`);
    return true;
  }

  getTransactionHistory(): Transaction[] {
    return this.transactions;
  }
}
