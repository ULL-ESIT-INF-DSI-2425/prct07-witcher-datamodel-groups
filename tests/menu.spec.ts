import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { InventoryService } from "../src/services/InventoryService";
import { TransactionService } from "../src/services/TransactionService";
import { Transaction } from "../src/models/Transaction";
import { Item } from "../src/models/Item";
import inquirer from "inquirer";
import { startInterface } from "../src/cli/menu";
import { v4 as uuidv4 } from "uuid";
import { Merchant } from "../src/models/Merchant";
import { Customer } from "../src/models/Customer";

describe("startInterface", () => {
  let inventario: InventoryService;
  let transacciones: TransactionService;
  let mockPrompt: any;

  beforeEach(() => {
    inventario = new InventoryService();
    transacciones = new TransactionService(inventario);

    // Mock directo de inquirer.prompt
    mockPrompt = vi.spyOn(inquirer, "prompt").mockImplementation(() => {
      return Promise.resolve({ option: "❌ Salir" }); // Valor por defecto para evitar errores
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    mockPrompt.mockRestore(); // Restaurar el mock después de cada prueba
  });

  test("debe mostrar el menú principal", async () => {
    mockPrompt.mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);

    expect(consoleSpy).toHaveBeenCalledWith("Bienvenido al sistema de gestión de inventario.");
    expect(mockPrompt).toHaveBeenCalledWith([
      {
        type: "list",
        name: "option",
        message: "Seleccione una opción:",
        choices: expect.arrayContaining([
          "📦 Añadir bien",
          "❌ Salir",
        ]),
      },
    ]);
  });

  test("debe añadir un bien al inventario", async () => {
    const nuevoItem = new Item("1", "Item1", "Descripción", "Material", 1, 100);

    mockPrompt
      .mockResolvedValueOnce({ option: "📦 Añadir bien" })
      .mockResolvedValueOnce({ ID: "1", Nombre: "Item1" })
      .mockResolvedValueOnce({
        Descripcion: "Descripción",
        Material: "Material",
        Peso: 1,
        Valor: 100,
        Cantidad: 10,
      });

    await startInterface(inventario, transacciones);
    expect(inventario.getStock()).toContainEqual({ item: nuevoItem, quantity: 10 });
  });

  test("debe eliminar un bien del inventario", async () => {
    const item = new Item("1", "Item1", "Descripción", "Material", 1, 100);
    inventario.addItem(item, 10);

    mockPrompt
      .mockResolvedValueOnce({ option: "📦 Eliminar bien" })
      .mockResolvedValueOnce({ ID: "1", Cantidad: "5" });

    await startInterface(inventario, transacciones);
    expect(inventario.getStock()).toContainEqual({ item, quantity: 5 });
  });

  test("debe modificar un bien en el inventario", async () => {
    const item = new Item("1", "Item1", "Descripción", "Material", 1, 100);
    inventario.addItem(item, 10);

    mockPrompt
      .mockResolvedValueOnce({ option: "📦 Modificar bien" })
      .mockResolvedValueOnce({ ID: "1" })
      .mockResolvedValueOnce({
        Nombre: "ItemModificado",
        Descripcion: "Nueva Descripción",
        Material: "Nuevo Material",
        Peso: 2,
        Valor: 200,
        Cantidad: 20,
      });

    await startInterface(inventario, transacciones);
    const modifiedItem = inventario.getStock().find(entry => entry.item.id === "1");
    expect(modifiedItem?.item.name).toBe("ItemModificado");
    expect(modifiedItem?.quantity).toBe(20);
  });

  test("debe ver los bienes en el inventario", async () => {
    const item = new Item("1", "Item1", "Descripción", "Material", 1, 100);
    inventario.addItem(item, 10);

    mockPrompt.mockResolvedValueOnce({ option: "📦 Ver bienes" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Item1"));
  });

  test("debe ordenar los bienes en el inventario", async () => {
    const item1 = new Item("1", "Item1", "Descripción", "Material", 1, 100);
    const item2 = new Item("2", "Item2", "Descripción", "Material", 2, 200);
    inventario.addItem(item1, 10);
    inventario.addItem(item2, 20);

    mockPrompt
      .mockResolvedValueOnce({ option: "📦 Ordenar bienes" })
      .mockResolvedValueOnce({ criterio: "Nombre", orden: "Ascendente" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Item1"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Item2"));
  });

  test("debe añadir un cliente", async () => {
    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Añadir cliente" })
      .mockResolvedValueOnce({
        nombreCliente: "Cliente1",
        idCliente: "1",
        razaCliente: "Raza1",
        ubicacionCliente: "Ubicación1",
      });

    await startInterface(inventario, transacciones);
    expect(inventario.getCustomers()).toContainEqual({
      id: "1",
      name: "Cliente1",
      race: "Raza1",
      location: "Ubicación1",
    });
  });

  test("debe eliminar un cliente", async () => {
    inventario.addCustomer({ id: "1", name: "Cliente1", race: "Raza1", location: "Ubicación1" });

    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Eliminar cliente" })
      .mockResolvedValueOnce({ idClienteEliminar: "1" });

    await startInterface(inventario, transacciones);
    expect(inventario.getCustomers()).not.toContainEqual({
      id: "1",
      name: "Cliente1",
      race: "Raza1",
      location: "Ubicación1",
    });
  });

  test("debe modificar un cliente", async () => {
    inventario.addCustomer({ id: "1", name: "Cliente1", race: "Raza1", location: "Ubicación1" });

    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Modificar cliente" })
      .mockResolvedValueOnce({ idClienteModificar: "1" })
      .mockResolvedValueOnce({
        nombreNuevo: "ClienteModificado",
        razaNueva: "RazaModificada",
        ubicacionNueva: "UbicaciónModificada",
      });

    await startInterface(inventario, transacciones);
    const modifiedCustomer = inventario.getCustomers().find(c => c.id === "1");
    expect(modifiedCustomer?.name).toBe("ClienteModificado");
    expect(modifiedCustomer?.race).toBe("RazaModificada");
    expect(modifiedCustomer?.location).toBe("UbicaciónModificada");
  });

  test("debe ver los clientes", async () => {
    inventario.addCustomer({ id: "1", name: "Cliente1", race: "Raza1", location: "Ubicación1" });

    mockPrompt.mockResolvedValueOnce({ option: "👤 Ver clientes" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Cliente1"));
  });

  test("debe ordenar los clientes", async () => {
    inventario.addCustomer({ id: "1", name: "Cliente1", race: "Raza1", location: "Ubicación1" });
    inventario.addCustomer({ id: "2", name: "Cliente2", race: "Raza2", location: "Ubicación2" });

    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Ordenar clientes" })
      .mockResolvedValueOnce({ criterioCliente: "Nombre", ordenCliente: "Ascendente" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Cliente1"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Cliente2"));
  });

  test("debe añadir un mercader", async () => {
    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Añadir mercader" })
      .mockResolvedValueOnce({
        nombreMercader: "Mercader1",
        idMercader: "1",
        tipoMercader: "Tipo1",
        ubicacionMercader: "Ubicación1",
      });

    await startInterface(inventario, transacciones);
    expect(inventario.getMerchants()).toContainEqual({
      id: "1",
      name: "Mercader1",
      type: "Tipo1",
      location: "Ubicación1",
    });
  });

  test("debe eliminar un mercader", async () => {
    inventario.addMerchant({ id: "1", name: "Mercader1", type: "Tipo1", location: "Ubicación1" });

    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Eliminar mercader" })
      .mockResolvedValueOnce({ idMercaderEliminar: "1" });

    await startInterface(inventario, transacciones);
    expect(inventario.getMerchants()).not.toContainEqual({
      id: "1",
      name: "Mercader1",
      type: "Tipo1",
      location: "Ubicación1",
    });
  });

  test("debe modificar un mercader", async () => {
    inventario.addMerchant({ id: "1", name: "Mercader1", type: "Tipo1", location: "Ubicación1" });

    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Modificar mercader" })
      .mockResolvedValueOnce({ idMercaderModificar: "1" })
      .mockResolvedValueOnce({
        nombreNuevo: "MercaderModificado",
        tipoNuevo: "TipoModificado",
        ubicacionNueva: "UbicaciónModificada",
      });

    await startInterface(inventario, transacciones);
    const modifiedMerchant = inventario.getMerchants().find(m => m.id === "1");
    expect(modifiedMerchant?.name).toBe("MercaderModificado");
    expect(modifiedMerchant?.type).toBe("TipoModificado");
    expect(modifiedMerchant?.location).toBe("UbicaciónModificada");
  });

  test("debe ver los mercaderes", async () => {
    inventario.addMerchant({ id: "1", name: "Mercader1", type: "Tipo1", location: "Ubicación1" });

    mockPrompt.mockResolvedValueOnce({ option: "👤 Ver mercaderes" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Mercader1"));
  });

  test("debe ordenar los mercaderes", async () => {
    inventario.addMerchant({ id: "1", name: "Mercader1", type: "Tipo1", location: "Ubicación1" });
    inventario.addMerchant({ id: "2", name: "Mercader2", type: "Tipo2", location: "Ubicación2" });

    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Ordenar mercaderes" })
      .mockResolvedValueOnce({ criterioMercader: "Nombre", ordenMercader: "Ascendente" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Mercader1"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Mercader2"));
  });

  test("debe registrar una transacción", async () => {
    const item = new Item("1", "Item1", "Descripción", "Material", 1, 100);
    inventario.addItem(item, 10);
    inventario.addCustomer({ id: "1", name: "Cliente1", race: "Raza1", location: "Ubicación1" });

    mockPrompt
      .mockResolvedValueOnce({ option: "🤝 Registrar transacción" })
      .mockResolvedValueOnce({ tipoTransaccion: "Venta" })
      .mockResolvedValueOnce({
        idTransaccion: "1",
        fechaTransaccion: "2023-01-01",
        idParticipante: "1",
      })
      .mockResolvedValueOnce({ idBien: "1", cantidadBien: 5 })
      .mockResolvedValueOnce({ añadirOtro: false });

    await startInterface(inventario, transacciones);
    const transaction = transacciones.getTransactionHistory().find(tx => tx.id === "1");
    expect(transaction).toBeDefined();
    expect(transaction?.items).toContainEqual({ item, quantity: 5 });
  });

  test("debe eliminar una transacción", () => {
    let testItem = new Item(
      "item-001",
      "Espada de Acero",
      "Espada forjada en acero valyrio.",
      "Acero Valyrio",
      3.5,
      150
    );

    let merchant = new Merchant(
      "merchant-001",
      "Armas del Norte",
      "Herrero",
      "Winterfell"
    );

    // Agregar stock inicial
    inventario.addItem(testItem, 10);
    const transaction = new Transaction(
      uuidv4(),
      new Date(),
      [{ item: testItem, quantity: 2 }],
      testItem.value * 2,
      merchant,
      "sale"
    );

    // Procesar transacción de venta
    const processed = transacciones.processTransaction(transaction);
    expect(processed).toBe(true);
    expect(transacciones.getTransactionHistory()).toHaveLength(1);

    // Eliminar la transacción
    const removed = transacciones.removeTransaction(transaction.id);
    expect(removed).toBe(true);
    expect(transacciones.getTransactionHistory()).toHaveLength(0);

    // Confirmar que el inventario se restauró correctamente
    const stockEntry = inventario.getStock().find(entry => entry.item.id === testItem.id);
    expect(stockEntry?.quantity).toBe(10); // Restaurado al valor original
  });

  test("debe ver las transacciones", async () => {
    const item = new Item("1", "Item1", "Descripción", "Material", 1, 100);
    inventario.addItem(item, 10);
  
    const customer = new Customer("1", "Cliente1", "Raza1", "Ubicación1");
    inventario.addCustomer(customer);
  
    const transaction = new Transaction(
      "1",
      new Date("2023-01-01"),
      [{ item, quantity: 5 }],
      500,
      customer,
      "sale"
    );
  
    transacciones.processTransaction(transaction);
  
    mockPrompt.mockResolvedValueOnce({ option: "🤝 Ver transacciones" });
  
    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);
  
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Item1"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("5"));
  });

  test("debe generar un informe de ingresos por ventas", async () => {
    const item = new Item("1", "Item1", "Descripción", "Material", 1, 100);
    inventario.addItem(item, 10);
  
    const customer = new Customer("1", "Cliente1", "Raza1", "Ubicación1");
    inventario.addCustomer(customer);
  
    const transaction = new Transaction(
      "1",
      new Date("2023-01-01"),
      [{ item, quantity: 5 }],
      500,
      customer,
      "sale"
    );
  
    transacciones.processTransaction(transaction);
  
    mockPrompt
      .mockResolvedValueOnce({ option: "🧾 Generar informes" })
      .mockResolvedValueOnce({ informe: "Total de ingresos por ventas" });
  
    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);
  
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("500"));
  });
  

  test("debe generar un informe de gastos por compras", async () => {
    const item = new Item("1", "Item1", "Descripción", "Material", 1, 100);
    inventario.addItem(item, 10);
  
    const customer = new Customer("1", "Cliente1", "Raza1", "Ubicación1");
    inventario.addCustomer(customer);
  
    const transaction = new Transaction(
      "1",
      new Date("2023-01-01"),
      [{ item, quantity: 5 }],
      500,
      customer,
      "purchase"
    );
  
    transacciones.processTransaction(transaction);
  
    mockPrompt
      .mockResolvedValueOnce({ option: "🧾 Generar informes" })
      .mockResolvedValueOnce({ informe: "Total de gastos por compras" });
  
    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);
  
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("500"));
  });
  

  test("debe generar un informe de bienes más vendidos", async () => {
    const item = new Item("1", "Item1", "Descripción", "Material", 1, 100);
    inventario.addItem(item, 10);
  
    const customer = new Customer("1", "Cliente1", "Raza1", "Ubicación1");
    inventario.addCustomer(customer);
  
    const transaction = new Transaction(
      "1",
      new Date("2023-01-01"),
      [{ item, quantity: 5 }],
      500,
      customer,
      "sale"
    );
  
    transacciones.processTransaction(transaction);
  
    mockPrompt
      .mockResolvedValueOnce({ option: "🧾 Generar informes" })
      .mockResolvedValueOnce({ informe: "Bienes más vendidos" });
  
    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);
  
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Item1"));
  });
  

  test("debe mostrar el historial de transacciones por participante", () => {
    const item = new Item("1", "Item1", "Descripción", "Material", 1, 100);
    inventario.addItem(item, 10);
  
    const customer = new Customer("1", "Cliente1", "Raza1", "Ubicación1");
    inventario.addCustomer(customer);
  
    const transaction = new Transaction(
      "1",
      new Date("2023-01-01"),
      [{ item, quantity: 5 }],
      500,
      customer,
      "sale"
    );
  
    transacciones.processTransaction(transaction);
  
    const history = transacciones.getTransactionsHistoryByParticipant(customer.id);
    expect(history).toHaveLength(1);
    expect(history[0].participant.id).toBe("1");
    expect(history[0].items[0].item.name).toBe("Item1");
  });
  

  test("debe salir del sistema", async () => {
    mockPrompt.mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);
    expect(consoleSpy).toHaveBeenCalledWith("Saliendo del sistema...");
  });
});