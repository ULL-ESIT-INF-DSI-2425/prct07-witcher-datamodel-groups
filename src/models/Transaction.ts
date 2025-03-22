import { Merchant } from "../models/Merchant.js";
import { Customer } from "../models/Customer.js";
import { Item } from "../models/Item.js";

/**
 * Representa una transacción dentro del sistema.
 */
export class Transaction {
  /**
   * Crea una nueva instancia de una transacción.
   * @param id - Identificador único de la transacción.
   * @param date - Fecha en la que se realizó la transacción.
   * @param items - Lista de ítems y cantidades involucrados en la transacción.
   * @param totalAmount - Monto total de la transacción.
   * @param participant - Participante de la transacción (comerciante o cliente).
   * @param type - Tipo de transacción (compra, venta o devolución).
   */
  constructor(
    public readonly id: string,
    public date: Date,
    public items: { item: Item; quantity: number }[],
    public totalAmount: number,
    public participant: Merchant | Customer,
    public type: "purchase" | "sale" | "return",
  ) {}
}
