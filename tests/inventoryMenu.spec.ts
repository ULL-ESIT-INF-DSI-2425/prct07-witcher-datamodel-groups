import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { InventoryService } from "../src/services/InventoryService";
import { TransactionService } from "../src/services/TransactionService";
import { Transaction } from "../src/models/Transaction";
import { Item } from "../src/models/Item";
import inquirer from "inquirer";
import { startInterface } from "../src/controllers/inventoryMenu";
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

    mockPrompt = vi.spyOn(inquirer, "prompt").mockImplementation(() => {
      return Promise.resolve({ option: "❌ Salir" });
    });

    vi.spyOn(console, "clear").mockImplementation(() => {});

    vi.clearAllMocks();
  });

  afterEach(() => {
    mockPrompt.mockRestore();
  });

  test("debe mostrar el menú principal", async () => {
    mockPrompt.mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Bienvenido al sistema de gestión de inventario.",
    );
    expect(mockPrompt).toHaveBeenCalledWith([
      {
        type: "list",
        name: "option",
        message: "Seleccione una opción:",
        choices: expect.arrayContaining(["📦 Añadir bien", "❌ Salir"]),
      },
    ]);
  });

  test("debe añadir un bien al inventario", async () => {
    const nuevoItem = new Item(
      "100",
      "Item1",
      "Descripción",
      "Material",
      1,
      100,
    );

    mockPrompt
      .mockResolvedValueOnce({ option: "📦 Añadir bien" })
      .mockResolvedValueOnce({ ID: "100", Nombre: "Item1" })
      .mockResolvedValueOnce({
        Descripcion: "Descripción",
        Material: "Material",
        Peso: 1,
        Valor: 100,
        Cantidad: 10,
      });

    await startInterface(inventario, transacciones);

    const stock = inventario.getStock();

    const itemEnInventario = stock.find((entry) => entry.item.id === "100");

    expect(itemEnInventario).toBeDefined();
    expect(itemEnInventario?.item).toEqual(nuevoItem);
    expect(itemEnInventario?.quantity).toBe(10);
  });

  test("debe eliminar un bien del inventario", async () => {
    mockPrompt
      .mockResolvedValueOnce({ option: "📦 Eliminar bien" })
      .mockResolvedValueOnce({ ID: "5", Cantidad: "1" });

    await startInterface(inventario, transacciones);
    const remainingIds = inventario.getStock().map((item) => item.item.id);

    expect(remainingIds).not.toContain("5");
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
    const modifiedItem = inventario
      .getStock()
      .find((entry) => entry.item.id === "1");
    expect(modifiedItem?.item.name).toBe("ItemModificado");
    expect(modifiedItem?.quantity).toBe(20);
  });

  test("debe ver los bienes en el inventario", async () => {
    const item = new Item(
      "21",
      "Poción de Curación",
      "Restaura salud",
      "Vidrio",
      0.5,
      75,
    );
    inventario.addItem(item, 5);

    mockPrompt.mockResolvedValueOnce({ option: "📦 Ver bienes" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);

    const logs = consoleSpy.mock.calls.map((call) => call[0]);

    expect(logs).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "ID: 21, Nombre: Poción de Curación, Descripción: Restaura salud, Material: Vidrio, Peso: 0.5, Valor: 75, Cantidad: 5",
        ),
      ]),
    );
  });

  test("debe ordenar los bienes en el inventario", async () => {
    mockPrompt
      .mockResolvedValueOnce({ option: "📦 Ordenar bienes" })
      .mockResolvedValueOnce({ criterio: "Nombre", orden: "Ascendente" });

    const consoleSpy = vi.spyOn(console, "log");

    await startInterface(inventario, transacciones);

    const logs = consoleSpy.mock.calls.map((call) => call[0]);

    const bienesOrdenados = logs.slice(2, -1);

    const nombresOrdenados = bienesOrdenados.map(
      (line) => line.match(/Nombre: (.+?),/)[1],
    );

    const nombresEsperados = [
      "Aceite para Espadas",
      "Aguamiel de Skellige",
      "Anillo de Protección",
      "Armadura Ligera",
      "Ballesta de Caza",
      "Bolsa de Hierbas",
      "Botas de Combate",
      "Collar de Vampiro",
      "Cuchillo de Arrojadizo",
      "Daga de Cazador",
      "Elixir de Golondrina",
      "Escudo de Mahakam",
      "Espada de Acero",
      "Espada de Plata",
      "Grimorio Antiguo",
      "Lámpara de Djinn",
      "Mutágenos de Necrófago",
      "Pergamino Arcano",
      "Runa de Igni",
      "Yelmo Encantado",
    ];

    expect(nombresOrdenados).toEqual(nombresEsperados);
  });

  test("debe añadir un cliente", async () => {
    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Añadir cliente" })
      .mockResolvedValueOnce({
        nombreCliente: "Cliente1",
        idCliente: "100",
        razaCliente: "Raza1",
        ubicacionCliente: "Ubicación1",
      });

    await startInterface(inventario, transacciones);
    expect(inventario.getCustomers()).toContainEqual({
      id: "100",
      name: "Cliente1",
      race: "Raza1",
      location: "Ubicación1",
    });
  });

  test("debe eliminar un cliente", async () => {
    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Eliminar cliente" })
      .mockResolvedValueOnce({ idClienteEliminar: "5" });

    await startInterface(inventario, transacciones);

    const remainingIds = inventario.getCustomers().map((c) => c.id);
    expect(remainingIds).not.toContain("5");
  });

  test("debe modificar un cliente", async () => {
    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Modificar cliente" })
      .mockResolvedValueOnce({ idClienteModificar: "1" })
      .mockResolvedValueOnce({
        nombreNuevo: "ClienteModificado",
        razaNueva: "RazaModificada",
        ubicacionNueva: "UbicaciónModificada",
      });

    await startInterface(inventario, transacciones);
    const modifiedCustomer = inventario
      .getCustomers()
      .find((c) => c.id === "1");
    expect(modifiedCustomer?.name).toBe("ClienteModificado");
    expect(modifiedCustomer?.race).toBe("RazaModificada");
    expect(modifiedCustomer?.location).toBe("UbicaciónModificada");
  });

  test("debe ver los clientes", async () => {
    inventario.addCustomer({
      id: "1",
      name: "Cliente1",
      race: "Raza1",
      location: "Ubicación1",
    });

    mockPrompt.mockResolvedValueOnce({ option: "👤 Ver clientes" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Cliente1"),
    );
  });

  test("debe ordenar los clientes", async () => {
    inventario.addCustomer({
      id: "1",
      name: "Cliente1",
      race: "Raza1",
      location: "Ubicación1",
    });
    inventario.addCustomer({
      id: "2",
      name: "Cliente2",
      race: "Raza2",
      location: "Ubicación2",
    });

    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Ordenar clientes" })
      .mockResolvedValueOnce({
        criterioCliente: "Nombre",
        ordenCliente: "Ascendente",
      });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Cliente1"),
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Cliente2"),
    );
  });

  test("debe añadir un mercader", async () => {
    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Añadir mercader" })
      .mockResolvedValueOnce({
        nombreMercader: "Mercader1",
        idMercader: "100",
        tipoMercader: "Tipo1",
        ubicacionMercader: "Ubicación1",
      });

    await startInterface(inventario, transacciones);
    expect(inventario.getMerchants()).toContainEqual({
      id: "100",
      name: "Mercader1",
      type: "Tipo1",
      location: "Ubicación1",
    });
  });

  test("debe eliminar un mercader", async () => {
    inventario.addMerchant({
      id: "11",
      name: "Mercader1",
      type: "Tipo1",
      location: "Ubicación1",
    });

    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Eliminar mercader" })
      .mockResolvedValueOnce({ idMercaderEliminar: "11" });

    await startInterface(inventario, transacciones);
    expect(inventario.getMerchants()).not.toContainEqual({
      id: "11",
      name: "Mercader1",
      type: "Tipo1",
      location: "Ubicación1",
    });
  });

  test("debe modificar un mercader", async () => {
    inventario.addMerchant({
      id: "1",
      name: "Mercader1",
      type: "Tipo1",
      location: "Ubicación1",
    });

    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Modificar mercader" })
      .mockResolvedValueOnce({ idMercaderModificar: "1" })
      .mockResolvedValueOnce({
        nombreNuevo: "Mercader1",
        tipoNuevo: "Tipo1",
        ubicacionNueva: "Ubicación1",
      });

    await startInterface(inventario, transacciones);
    const modifiedMerchant = inventario
      .getMerchants()
      .find((m) => m.id === "1");
    expect(modifiedMerchant?.name).toBe("Mercader1");
    expect(modifiedMerchant?.type).toBe("Tipo1");
    expect(modifiedMerchant?.location).toBe("Ubicación1");
  });

  test("debe ver los mercaderes", async () => {
    inventario.addMerchant({
      id: "1",
      name: "Mercader1",
      type: "Tipo1",
      location: "Ubicación1",
    });

    mockPrompt.mockResolvedValueOnce({ option: "👤 Ver mercaderes" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Mercader1"),
    );
  });

  test("debe ordenar los mercaderes", async () => {
    inventario.addMerchant({
      id: "1",
      name: "Mercader1",
      type: "Tipo1",
      location: "Ubicación1",
    });
    inventario.addMerchant({
      id: "2",
      name: "Mercader2",
      type: "Tipo2",
      location: "Ubicación2",
    });

    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Ordenar mercaderes" })
      .mockResolvedValueOnce({
        criterioMercader: "Nombre",
        ordenMercader: "Ascendente",
      });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Mercader1"),
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Mercader2"),
    );
  });

  test("debe registrar una transacción", async () => {
    const item = new Item("1", "Item1", "Descripción", "Material", 1, 100);
    inventario.addItem(item, 10);
    inventario.addCustomer(
      new Customer("1", "Cliente1", "Raza1", "Ubicación1"),
    );

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

    const history = transacciones.getTransactionHistory();
    expect(history.length).toBe(0);
    transacciones.processTransaction(
      new Transaction(
        "1",
        new Date("2023-01-01"),
        [{ item, quantity: 5 }],
        500,
        new Customer("1", "Cliente1", "Raza1", "Ubicación1"),
        "sale",
      ),
    );
    expect(history.length).toBe(1);
  });

  test("debe eliminar una transacción", () => {
    let testItem = new Item(
      "item-001",
      "Espada de Acero",
      "Espada forjada en acero valyrio.",
      "Acero Valyrio",
      3.5,
      150,
    );

    let merchant = new Merchant(
      "merchant-001",
      "Armas del Norte",
      "Herrero",
      "Winterfell",
    );
    +inventario.addItem(testItem, 10);
    const transaction = new Transaction(
      uuidv4(),
      new Date(),
      [{ item: testItem, quantity: 2 }],
      testItem.value * 2,
      merchant,
      "sale",
    );

    const processed = transacciones.processTransaction(transaction);
    expect(processed).toBe(true);
    expect(transacciones.getTransactionHistory()).toHaveLength(1);

    const removed = transacciones.removeTransaction(transaction.id);
    expect(removed).toBe(true);
    expect(transacciones.getTransactionHistory()).toHaveLength(0);

    const stockEntry = inventario
      .getStock()
      .find((entry) => entry.item.id === testItem.id);
    expect(stockEntry?.quantity).toBe(10);
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
      "sale",
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
      "sale",
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
      "purchase",
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
      "sale",
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
      "sale",
    );

    transacciones.processTransaction(transaction);

    const history = transacciones.getTransactionsHistoryByParticipant(
      customer.id,
    );
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

  test("debe mostrar un mensaje cuando no hay bienes en el inventario", async () => {
    inventario.getStock = vi.fn().mockReturnValue([]);

    mockPrompt.mockResolvedValueOnce({ option: "📦 Ver bienes" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);

    expect(consoleSpy).toHaveBeenCalledWith("No hay bienes en el inventario.");
  });

  test("debe mostrar un mensaje cuando no se encuentran bienes", async () => {
    mockPrompt
      .mockResolvedValueOnce({ option: "📦 Buscar bien" })
      .mockResolvedValueOnce({
        criterioBusqueda: "Nombre",
        terminoBusqueda: "NoExistente",
      });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);

    expect(consoleSpy).toHaveBeenCalledWith(
      "No se encontraron bienes que coincidan con la búsqueda.",
    );

    consoleSpy.mockRestore();
  });

  test.each([
    ["ID", "103", "103", "Daga Oscura", "Una daga muy afilada", "Madera"],
    ["Nombre", "daga", "103", "Daga Oscura", "Una daga muy afilada", "Madera"],
    [
      "Descripción",
      "afilada",
      "103",
      "Daga Oscura",
      "Una daga muy afilada",
      "Madera",
    ],
    [
      "Material",
      "madera",
      "104",
      "Bastón Mágico",
      "Hecho con magia ancestral",
      "Madera",
    ],
  ])(
    "debe encontrar bienes por %s",
    async (
      criterioBusqueda,
      terminoBusqueda,
      id,
      name,
      description,
      material,
    ) => {
      inventario.getStock = vi.fn().mockReturnValue([
        {
          item: { id, name, description, material, weight: "2kg", value: 100 },
          quantity: 5,
        },
      ]);

      mockPrompt
        .mockResolvedValueOnce({ option: "📦 Buscar bien" })
        .mockResolvedValueOnce({ criterioBusqueda, terminoBusqueda });

      const consoleSpy = vi.spyOn(console, "log");

      await startInterface(inventario, transacciones);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(name));

      consoleSpy.mockRestore();
    },
  );

  test("debe generar un informe de bienes más vendidos", async () => {
    const item = new Item("100", "Item1", "Descripción", "Material", 1, 100);
    inventario.addItem(item, 10);

    const customer = new Customer("100", "Cliente1", "Raza1", "Ubicación1");
    inventario.addCustomer(customer);

    const transaction = new Transaction(
      "1",
      new Date("2023-01-01"),
      [{ item, quantity: 5 }],
      500,
      customer,
      "sale",
    );

    transacciones.processTransaction(transaction);

    mockPrompt.mockResolvedValueOnce({ option: "🧾 Bien más vendido" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Item1"));
  });

  test("debe mostrar el historial si hay transacciones para el participante", async () => {
    const participante = new Customer(
      "p1",
      "Geralt de Rivia",
      "Humano",
      "Kaer Morhen",
    );
    const item = new Item(
      "1",
      "Espada de Plata",
      "Letal contra monstruos",
      "Plata",
      3,
      500,
    );

    inventario.addItem(item, 5);

    const transaccion = new Transaction(
      "t1",
      new Date("2025-03-20T10:00:00"),
      [{ item, quantity: 1 }],
      500,
      participante,
      "sale",
    );

    transacciones.processTransaction(transaccion);

    mockPrompt
      .mockResolvedValueOnce({
        option: "🧾 Historial de transacciones por participante",
      })
      .mockResolvedValueOnce({ idParticipante2: "p1" })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");

    await startInterface(inventario, transacciones);

    const output = consoleSpy.mock.calls.map((call) => call[0]).join("\n");

    expect(output).toContain(
      "Historial de transacciones para el participante con ID p1",
    );
    expect(output).toContain("Espada de Plata (x1)");
    expect(output).toContain("500 coronas");
    expect(output).toContain("Geralt de Rivia");
  });

  test("debe mostrar mensaje si no hay transacciones para el participante", async () => {
    mockPrompt
      .mockResolvedValueOnce({
        option: "🧾 Historial de transacciones por participante",
      })
      .mockResolvedValueOnce({ idParticipante2: "p999" })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");

    await startInterface(inventario, transacciones);

    const output = consoleSpy.mock.calls.map((call) => call[0]).join("\n");

    expect(output).toContain(
      "No hay transacciones registradas para ese participante.",
    );
  });

  test("debe mostrar todas las transacciones cuando existen (🤝 Ver transacciones)", async () => {
    const participante = new Customer("c1", "Ciri", "Humana", "Cintra");
    const item = new Item(
      "i1",
      "Daga élfica",
      "Corta y precisa",
      "Acero",
      1,
      200,
    );
    inventario.addItem(item, 3);
    const transaccion = new Transaction(
      "tx1",
      new Date("2025-03-21T10:00:00"),
      [{ item, quantity: 1 }],
      200,
      participante,
      "sale",
    );
    transacciones.processTransaction(transaccion);

    mockPrompt
      .mockResolvedValueOnce({ option: "🤝 Ver transacciones" })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");

    await startInterface(inventario, transacciones);

    const logs = consoleSpy.mock.calls.map((c) => c[0]).join("\n");

    expect(logs).toContain("Historial de transacciones:");
    expect(logs).toContain("Ciri");
    expect(logs).toContain("Daga élfica");
  });

  test("debe mostrar mensaje si no hay transacciones (🤝 Ver transacciones)", async () => {
    mockPrompt
      .mockResolvedValueOnce({ option: "🤝 Ver transacciones" })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");

    await startInterface(inventario, transacciones);

    expect(consoleSpy).toHaveBeenCalledWith(
      "No hay transacciones registradas.",
    );
  });

  test("debe eliminar transacción existente (🤝 Eliminar transacción)", async () => {
    const participante = new Customer("c2", "Triss", "Humana", "Temeria");
    const item = new Item(
      "i2",
      "Poción de maná",
      "Recupera energía mágica",
      "Cristal",
      0.5,
      150,
    );
    inventario.addItem(item, 3);
    const tx = new Transaction(
      "txDel",
      new Date(),
      [{ item, quantity: 1 }],
      150,
      participante,
      "sale",
    );
    transacciones.processTransaction(tx);

    mockPrompt
      .mockResolvedValueOnce({ option: "🤝 Eliminar transacción" })
      .mockResolvedValueOnce({ idTransaccion2: "txDel" })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");

    await startInterface(inventario, transacciones);

    const logs = consoleSpy.mock.calls.map((c) => c[0]).join("\n");

    expect(logs).toContain("Transacción eliminada con éxito.");
  });

  test("debe mostrar mensaje si transacción no existe (🤝 Eliminar transacción)", async () => {
    mockPrompt
      .mockResolvedValueOnce({ option: "🤝 Eliminar transacción" })
      .mockResolvedValueOnce({ idTransaccion2: "inexistente" })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");

    await startInterface(inventario, transacciones);

    const logs = consoleSpy.mock.calls.map((c) => c[0]).join("\n");

    expect(logs).toContain("No se encontró ninguna transacción con ese ID.");
  });

  test("debe encontrar transacción por fecha (🤝 Buscar transacciones)", async () => {
    const participante = new Customer("c3", "Yennefer", "Humana", "Aretuza");
    const item = new Item(
      "i3",
      "Collar mágico",
      "Artefacto de protección",
      "Oro",
      0.3,
      300,
    );
    inventario.addItem(item, 2);
    const fecha = new Date("2025-03-21T00:00:00");
    const tx = new Transaction(
      "txFecha",
      fecha,
      [{ item, quantity: 1 }],
      300,
      participante,
      "sale",
    );
    transacciones.processTransaction(tx);

    mockPrompt
      .mockResolvedValueOnce({ option: "🤝 Buscar transacciones" })
      .mockResolvedValueOnce({
        criterioTransaccion: "Fecha (DD/MM/AAAA)",
        terminoTransaccion: fecha.toLocaleDateString(),
      })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");

    await startInterface(inventario, transacciones);

    const logs = consoleSpy.mock.calls.map((c) => c[0]).join("\n");

    expect(logs).toContain("Transacciones encontradas:");
    expect(logs).toContain("Yennefer");
    expect(logs).toContain("Collar mágico");
  });

  test("debe encontrar transacción por participante (🤝 Buscar transacciones)", async () => {
    const participante = new Customer("c4", "Dandelion", "Humano", "Oxenfurt");
    const item = new Item(
      "i4",
      "Laúd encantado",
      "Perfecto para serenatas",
      "Madera",
      1,
      180,
    );
    inventario.addItem(item, 2);
    const tx = new Transaction(
      "txPart",
      new Date(),
      [{ item, quantity: 1 }],
      180,
      participante,
      "sale",
    );
    transacciones.processTransaction(tx);

    mockPrompt
      .mockResolvedValueOnce({ option: "🤝 Buscar transacciones" })
      .mockResolvedValueOnce({
        criterioTransaccion: "Participante (ID)",
        terminoTransaccion: "c4",
      })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);

    const logs = consoleSpy.mock.calls.map((c) => c[0]).join("\n");

    expect(logs).toContain("Transacciones encontradas:");
    expect(logs).toContain("Dandelion");
    expect(logs).toContain("Laúd encantado");
  });

  test("debe mostrar mensaje si no encuentra coincidencias (🤝 Buscar transacciones)", async () => {
    mockPrompt
      .mockResolvedValueOnce({ option: "🤝 Buscar transacciones" })
      .mockResolvedValueOnce({
        criterioTransaccion: "Participante (ID)",
        terminoTransaccion: "id-inexistente",
      })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);

    const logs = consoleSpy.mock.calls.map((c) => c[0]).join("\n");

    expect(logs).toContain(
      "No se encontraron transacciones que coincidan con la búsqueda.",
    );
  });

  test("debe mostrar mercaderes existentes (👤 Ver mercaderes)", async () => {
    inventario.addMerchant({
      id: "m1",
      name: "Zoltan",
      type: "Armas",
      location: "Novigrado",
    });

    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Ver mercaderes" })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");

    await startInterface(inventario, transacciones);

    const logs = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(logs).toContain("Mercaderes registrados:");
    expect(logs).toContain("Zoltan");
  });

  test("debe modificar un mercader existente (👤 Modificar mercader)", async () => {
    inventario.addMerchant({
      id: "m2",
      name: "Tibor",
      type: "Armaduras",
      location: "Vizima",
    });

    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Modificar mercader" })
      .mockResolvedValueOnce({ idMercaderModificar: "m2" })
      .mockResolvedValueOnce({
        nombreNuevo: "Tibor el Fuerte",
        tipoNuevo: "Armaduras pesadas",
        ubicacionNueva: "Kaedwen",
      })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");

    await startInterface(inventario, transacciones);

    const logs = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(logs).toContain("Mercader modificado con éxito.");

    const mercaderModificado = inventario
      .getMerchants()
      .find((m) => m.id === "m2");
    expect(mercaderModificado?.name).toBe("Tibor el Fuerte");
    expect(mercaderModificado?.type).toBe("Armaduras pesadas");
    expect(mercaderModificado?.location).toBe("Kaedwen");
  });

  test("debe mostrar mensaje si no se encuentra el mercader (👤 Modificar mercader)", async () => {
    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Modificar mercader" })
      .mockResolvedValueOnce({ idMercaderModificar: "mInexistente" })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");

    await startInterface(inventario, transacciones);

    const logs = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(logs).toContain("No se encontró ningún mercader con ese ID.");
  });

  test("debe ordenar mercaderes por nombre ascendente (👤 Ordenar mercaderes)", async () => {
    inventario.addMerchant({
      id: "m3",
      name: "Bruno",
      type: "Comida",
      location: "Oxenfurt",
    });
    inventario.addMerchant({
      id: "m4",
      name: "Alfred",
      type: "Comida",
      location: "Oxenfurt",
    });

    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Ordenar mercaderes" })
      .mockResolvedValueOnce({
        criterioMercader: "Nombre",
        ordenMercader: "Ascendente",
      })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");

    await startInterface(inventario, transacciones);

    const logs = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    const indexAlfred = logs.indexOf("Alfred");
    const indexBruno = logs.indexOf("Bruno");

    expect(indexAlfred).toBeLessThan(indexBruno);
  });

  test("debe ordenar mercaderes por nombre descendente (👤 Ordenar mercaderes)", async () => {
    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Ordenar mercaderes" })
      .mockResolvedValueOnce({
        criterioMercader: "Nombre",
        ordenMercader: "Descendente",
      })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");

    await startInterface(inventario, transacciones);

    const logs = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    const indexAlfred = logs.indexOf("Alfred");
    const indexBruno = logs.indexOf("Bruno");

    expect(indexBruno).toBeLessThan(indexAlfred);
  });

  test("debe ordenar mercaderes por tipo ascendente (👤 Ordenar mercaderes)", async () => {
    inventario.addMerchant({
      id: "m5",
      name: "Cedric",
      type: "Herramientas",
      location: "Skellige",
    });
    inventario.addMerchant({
      id: "m6",
      name: "Derek",
      type: "Alquimia",
      location: "Skellige",
    });

    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Ordenar mercaderes" })
      .mockResolvedValueOnce({
        criterioMercader: "Tipo",
        ordenMercader: "Ascendente",
      })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);

    const logs = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    const indexAlquimia = logs.indexOf("Alquimia");
    const indexHerramientas = logs.indexOf("Herramientas");

    expect(indexAlquimia).toBeLessThan(indexHerramientas);
  });

  test("debe ordenar mercaderes por tipo descendente (👤 Ordenar mercaderes)", async () => {
    mockPrompt
      .mockResolvedValueOnce({ option: "👤 Ordenar mercaderes" })
      .mockResolvedValueOnce({
        criterioMercader: "Tipo",
        ordenMercader: "Descendente",
      })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);

    const logs = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    const indexAlquimia = logs.indexOf("Alquimia");
    const indexHerramientas = logs.indexOf("Herramientas");

    expect(indexHerramientas).toBeLessThan(indexAlquimia);
  });

  test("debe mostrar mensaje si participante no existe (🤝 Registrar transacción)", async () => {
    mockPrompt
      .mockResolvedValueOnce({ option: "🤝 Registrar transacción" })
      .mockResolvedValueOnce({ type: "Compra", participantId: "no-existe" })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");

    await startInterface(inventario, transacciones);

    expect(consoleSpy).toHaveBeenCalledWith(
      "No se encontró un participante válido.",
    );
  });

  test("debe registrar transacción de compra con ítem nuevo", async () => {
    inventario.addCustomer(
      new Customer("cli-1", "Geralt", "Raza1", "Kaer Morhen"),
    );

    mockPrompt
      .mockResolvedValueOnce({ option: "🤝 Registrar transacción" })
      .mockResolvedValueOnce({ type: "Compra", participantId: "cli-1" })
      .mockResolvedValueOnce({ isNewItem: true })
      .mockResolvedValueOnce({
        name: "Espada de plata",
        description: "Espada para monstruos",
        material: "Plata",
        weight: "3",
        value: "500",
        quantity: "2",
      })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");

    await startInterface(inventario, transacciones);

    const logs = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(logs).toContain("Transacción procesada exitosamente.");
  });

  test("debe registrar transacción de compra con ítem existente", async () => {
    inventario.addCustomer(
      new Customer("cli-2", "Yennefer", "Raza1", "Vengerberg"),
    );

    const item = new Item(
      "i1",
      "Poción de maná",
      "Restablece energía mágica",
      "Vidrio",
      0.5,
      100,
    );
    inventario.addItem(item, 10);

    mockPrompt
      .mockResolvedValueOnce({ option: "🤝 Registrar transacción" })
      .mockResolvedValueOnce({ type: "Compra", participantId: "cli-2" })
      .mockResolvedValueOnce({ isNewItem: false })
      .mockResolvedValueOnce({ selectedItems: ["i1"] })
      .mockResolvedValueOnce({ i1: "3" })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);

    const logs = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(logs).toContain("Transacción procesada exitosamente.");
  });

  test("debe registrar transacción de venta", async () => {
    inventario.addMerchant({
      id: "m1",
      name: "Triss",
      type: "Hechicería",
      location: "Temeria",
    });

    const item = new Item(
      "i2",
      "Cristal mágico",
      "Elemento arcano",
      "Cristal",
      1,
      300,
    );
    inventario.addItem(item, 5);

    mockPrompt
      .mockResolvedValueOnce({ option: "🤝 Registrar transacción" })
      .mockResolvedValueOnce({ type: "Venta", participantId: "m1" })
      .mockResolvedValueOnce({ selectedItems: ["i2"] })
      .mockResolvedValueOnce({ i2: "2" })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);

    const logs = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(logs).toContain("Transacción procesada exitosamente.");
  });

  test("debe registrar transacción de devolución", async () => {
    inventario.addMerchant({
      id: "m2",
      name: "Lambert",
      type: "Armas",
      location: "Kaer Morhen",
    });

    const item = new Item(
      "i3",
      "Escudo",
      "Protección básica",
      "Hierro",
      5,
      150,
    );
    inventario.addItem(item, 3);

    mockPrompt
      .mockResolvedValueOnce({ option: "🤝 Registrar transacción" })
      .mockResolvedValueOnce({ type: "Devolución", participantId: "m2" })
      .mockResolvedValueOnce({ selectedItems: ["i3"] })
      .mockResolvedValueOnce({ i3: "1" })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);

    const logs = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(logs).toContain("Transacción procesada exitosamente.");
  });

  test("debe mostrar mensaje si no se seleccionan ítems válidos", async () => {
    inventario.addCustomer(new Customer("cli-3", "Ciri", "Raza1", "Cintra"));

    mockPrompt
      .mockResolvedValueOnce({ option: "🤝 Registrar transacción" })
      .mockResolvedValueOnce({ type: "Compra", participantId: "cli-3" })
      .mockResolvedValueOnce({ isNewItem: false })
      .mockResolvedValueOnce({ selectedItems: [] })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");
    await startInterface(inventario, transacciones);

    const logs = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(logs).toContain("No se encontraron bienes válidos.");
  });

  test("debe mostrar mensaje si transacción no se procesa", async () => {
    // Sobrescribir processTransaction para simular fallo
    const failProcess = vi
      .spyOn(transacciones, "processTransaction")
      .mockReturnValue(false);
    inventario.addCustomer(
      new Customer("cli-4", "Eskel", "Raza1", "Kaer Morhen"),
    );
    const item = new Item(
      "i4",
      "Botas de cuero",
      "Botas reforzadas",
      "Cuero",
      2,
      200,
    );
    inventario.addItem(item, 4);

    mockPrompt
      .mockResolvedValueOnce({ option: "🤝 Registrar transacción" })
      .mockResolvedValueOnce({ type: "Compra", participantId: "cli-4" })
      .mockResolvedValueOnce({ isNewItem: false })
      .mockResolvedValueOnce({ selectedItems: ["i4"] })
      .mockResolvedValueOnce({ i4: "2" })
      .mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");

    await startInterface(inventario, transacciones);

    const logs = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(logs).toContain("No se pudo procesar la transacción.");

    failProcess.mockRestore();
  });

  test("Debería iniciar correctamente la interfaz", async () => {
    mockPrompt.mockResolvedValueOnce({ option: "❌ Salir" });

    await startInterface(inventario, transacciones);

    expect(mockPrompt).toHaveBeenCalled();
  });

  test("Debería buscar clientes por nombre", async () => {
    inventario.addCustomer(new Customer("1", "Juan", "Humano", "Ciudad A"));
    inventario.addCustomer(new Customer("2", "Pedro", "Elfo", "Ciudad B"));

    mockPrompt.mockResolvedValueOnce({ option: "👤 Buscar clientes" });
    mockPrompt.mockResolvedValueOnce({
      criterioClienteBuscar: "Nombre",
      terminoClienteBuscar: "Juan",
    });
    mockPrompt.mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");

    await startInterface(inventario, transacciones);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Juan"));
  });

  test("Debería buscar mercaderes por tipo", async () => {
    inventario.addMerchant(new Merchant("1", "Carlos", "Vendedor", "Ciudad C"));
    inventario.addMerchant(new Merchant("2", "Luis", "Artesano", "Ciudad D"));

    mockPrompt.mockResolvedValueOnce({ option: "👤 Buscar mercaderes" });
    mockPrompt.mockResolvedValueOnce({
      criterioMercaderBuscar: "Tipo",
      terminoMercaderBuscar: "Vendedor",
    });
    mockPrompt.mockResolvedValueOnce({ option: "❌ Salir" });

    const consoleSpy = vi.spyOn(console, "log");

    await startInterface(inventario, transacciones);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Carlos"));
  });
});
