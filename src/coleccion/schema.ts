import { Merchant } from "../models/Merchant.js";
import { Customer } from "../models/Customer.js";
import { Item } from "../models/Item.js";

/**
 * Representa la estructura del esquema de datos del sistema.
 */
export type Schema = {
  /**
   * Lista de bienes disponibles en el sistema.
   */
  bienes: Item[];
  
  /**
   * Lista de mercaderes registrados en el sistema.
   */
  mercaderes: Merchant[];
  
  /**
   * Lista de clientes registrados en el sistema.
   */
  clientes: Customer[];
};
