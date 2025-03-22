import { InventoryService } from "./services/InventoryService.js";
import { TransactionService } from "./services/TransactionService.js";
import { startInterface } from "./cli/menu.js";
import { db, saveData } from "./coleccion/coleccion.js";
// Inicializar base de datos si es necesario
db.read();
if (!db.data) {
    console.log("La base de datos estaba vacía. Inicializando con datos por defecto...");
    saveData({ bienes: [], mercaderes: [], clientes: [] });
}
// Inicializar servicios
const inventario = new InventoryService();
const transacciones = new TransactionService(inventario);
console.log("Inventario y servicios inicializados correctamente.");
// Iniciar la interfaz del menú
startInterface(inventario, transacciones);
