import { InventoryService } from "./services/InventoryService.js";
import { TransactionService } from "./services/TransactionService.js";
import { startInterface } from "./controllers/inventoryMenu.js";
import { db, saveData } from "./database/coleccion.js";
db.read();
if (!db.data) {
    console.log("La base de datos estaba vacía. Inicializando con datos por defecto...");
    saveData({ bienes: [], mercaderes: [], clientes: [] });
}
const inventario = new InventoryService();
const transacciones = new TransactionService(inventario);
console.log("Inventario y servicios inicializados correctamente.");
startInterface(inventario, transacciones);
