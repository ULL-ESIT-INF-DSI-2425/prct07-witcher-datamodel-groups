import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { InventoryService } from "../src/services/InventoryService";
import { TransactionService } from "../src/services/TransactionService";
import { Item } from "../src/models/Item";
import inquirer from "inquirer";
import { startInterface } from "../src/cli/menu";

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

  test("debe eliminar una transacción", async () => {
    const item = new Item("1", "Item1", "Descripción", "Material", 1, 100);
    inventario.addItem(item, 10);
    inventario.addCustomer({ id: "1", name: "Cliente1", race: "Raza1", location: "Ubicación1" });

    transacciones.processTransaction(
      inventario.getCustomers()[0],
      [{ item, quantity: 5 }],
      "sale"
    );

    mockPrompt
      .mockResolvedValueOnce({ option: "🤝 Eliminar transacción" })
      .mockResolvedValueOnce({ idTransaccion2: "1" });

    await startInterface(inventario, transacciones);
    expect(transacciones.getTransactionHistory()).not.toContainEqual(
      expect.objectContaining({ id: "1" })
    );
  });

  test("debe ver las transacciones", async () => {
    const item = new Item("1", "Item1", "Descripción", "Material", 1, 100);
    inventario.addItem(item, 10);
    inventario.addCustomer({ id: "1", name: "Cliente1", race: "Raza1", location: "Ubicación1" });

    transacciones.processTransaction(
      inventario.getCustomers()[0],
      [{ item, quantity: 5 }],
      "sale"
    );

    mockPrompt.mockResolvedValueOnce({ option: "🤝 Ver transacciones" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Item1"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("5"));
  });

  test("debe generar un informe de ingresos por ventas", async () => {
    const item = new Item("1", "Item1", "Descripción", "Material", 1, 100);
    inventario.addItem(item, 10);
    inventario.addCustomer({ id: "1", name: "Cliente1", race: "Raza1", location: "Ubicación1" });

    transacciones.processTransaction(
      inventario.getCustomers()[0],
      [{ item, quantity: 5 }],
      "sale"
    );

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
    inventario.addCustomer({ id: "1", name: "Cliente1", race: "Raza1", location: "Ubicación1" });

    transacciones.processTransaction(
      inventario.getCustomers()[0],
      [{ item, quantity: 5 }],
      "purchase"
    );

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
    inventario.addCustomer({ id: "1", name: "Cliente1", race: "Raza1", location: "Ubicación1" });

    transacciones.processTransaction(
      inventario.getCustomers()[0],
      [{ item, quantity: 5 }],
      "sale"
    );

    mockPrompt
      .mockResolvedValueOnce({ option: "🧾 Generar informes" })
      .mockResolvedValueOnce({ informe: "Bienes más vendidos" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Item1"));
  });

  test("debe mostrar el historial de transacciones por participante", async () => {
    const item = new Item("1", "Item1", "Descripción", "Material", 1, 100);
    inventario.addItem(item, 10); // Añadir un bien al inventario
    inventario.addCustomer({ id: "1", name: "Cliente1", race: "Raza1", location: "Ubicación1" }); // Añadir un cliente
  
    // Registrar una transacción para el cliente
    transacciones.processTransaction(
      inventario.getCustomers()[0], // Cliente con ID "1"
      [{ item, quantity: 5 }], // Item y cantidad
      "sale" // Tipo de transacción
    );
  
    // Simulamos las respuestas del usuario
    mockPrompt
      .mockResolvedValueOnce({ option: "🧾 Historial de transacciones por participante" }) // Selecciona la opción de historial
      .mockResolvedValueOnce({ idParticipante2: "1" }); // Ingresa el ID del participante
  
    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);
  
    // Verificamos que se mostró el historial de transacciones
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Item1"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("5")); // Verifica la cantidad
  });

  test("debe salir del sistema", async () => {
    mockPrompt.mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);
    expect(consoleSpy).toHaveBeenCalledWith("Saliendo del sistema...");
  });
});