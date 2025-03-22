import { Transaction } from "../models/Transaction.js";
import { InventoryService } from "./InventoryService.js";
import { Item } from "../models/Item.js";
import { Merchant } from "../models/Merchant.js";
import { Customer } from "../models/Customer.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Servicio encargado de gestionar las transacciones en el sistema.
 */
export class TransactionService {
  private transactions: Transaction[] = [];

  /**
   * Crea una instancia del servicio de transacciones.
   * @param inventory - Servicio de inventario utilizado para actualizar el stock.
   */
  constructor(private inventory: InventoryService) {}

  /**
   * Procesa una transacción, ya sea una venta, devolución o compra.
   * @param transaction - La transacción a procesar.
   * @returns `true` si la transacción fue procesada con éxito, `false` en caso contrario.
   */
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

  /**
   * Obtiene el historial completo de transacciones.
   * @returns Un arreglo con todas las transacciones registradas.
   */
  getTransactionHistory(): Transaction[] {
    return this.transactions;
  }

  /**
   * Obtiene el historial de transacciones de un participante específico.
   * @param participantId - ID del participante (cliente o comerciante).
   * @returns Un arreglo con las transacciones asociadas al participante.
   */
  getTransactionsHistoryByParticipant(participantId: string): Transaction[] {
    return this.transactions.filter(
      (tx) => tx.participant.id === participantId,
    );
  }

  /**
   * Calcula el ingreso total generado por las ventas.
   * @returns La suma total de todas las ventas realizadas.
   */
  getTotalIncome(): number {
    return this.transactions
      .filter((tx) => tx.type === "sale")
      .reduce((total, tx) => total + tx.totalAmount, 0);
  }

  /**
   * Calcula el gasto total generado por las compras.
   * @returns La suma total de todas las compras realizadas.
   */
  getTotalExpenses(): number {
    return this.transactions
      .filter((tx) => tx.type === "purchase")
      .reduce((total, tx) => total + tx.totalAmount, 0);
  }

  /**
   * Obtiene los artículos más vendidos dentro del sistema.
   * @param limit - Número máximo de artículos a devolver (por defecto 5).
   * @returns Un arreglo con los artículos más vendidos y sus cantidades.
   */
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

  /**
   * Elimina una transacción del historial y revierte sus efectos en el inventario.
   * @param transactionId - ID de la transacción a eliminar.
   * @returns `true` si la transacción fue eliminada con éxito, `false` si no se encontró.
   */
  removeTransaction(transactionId: string): boolean {
    const transactionIndex = this.transactions.findIndex(
      (tx) => tx.id === transactionId,
    );
    if (transactionIndex === -1) return false;

    const transaction = this.transactions[transactionIndex];
    if (transaction.type === "sale" || transaction.type === "return") {
      transaction.items.forEach(({ item, quantity }) => {
        this.inventory.addItem(item, quantity);
      });
    } else {
      transaction.items.forEach(({ item, quantity }) => {
        this.inventory.removeItem(item.id, quantity);
      });
    }

    this.transactions.splice(transactionIndex, 1);
    return true;
  }
}
