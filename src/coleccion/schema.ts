import { Merchant } from "../models/Merchant.js";
import { Customer } from "../models/Customer.js";
import { Item } from "../models/Item.js";

export type Schema = {
  bienes: Item[];
  mercaderes: Merchant[];
  clientes: Customer[];
};
