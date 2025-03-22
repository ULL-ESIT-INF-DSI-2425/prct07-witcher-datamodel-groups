import { Merchant } from "../models/Merchant.js";
import { Customer } from "../models/Customer.js";
import { Item } from "../models/Item.js";

export class Transaction {
  constructor(
    public readonly id: string,
    public date: Date,
    public items: { item: Item; quantity: number }[],
    public totalAmount: number,
    public participant: Merchant | Customer,
    public type: "purchase" | "sale" | "return",
  ) {}
}
