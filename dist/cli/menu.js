import { Item } from "../models/Item.js";
import inquirer from "inquirer";
export async function startInterface(inventario, transacciones) {
    console.clear();
    console.log("Bienvenido al sistema de gestión de inventario.");
    while (true) {
        const { option } = await inquirer.prompt([
            {
                type: "list",
                name: "option",
                message: "Seleccione una opción:",
                choices: [
                    "📦 Añadir bien",
                    "📦 Eliminar bien",
                    "📦 Modificar bien",
                    "📦 Ver bienes",
                    "📦 Ordenar bienes",
                    "👤 Añadir cliente",
                    "👤 Eliminar cliente",
                    "👤 Modificar cliente",
                    "👤 Ver clientes",
                    "👤 Ordenar clientes",
                    "👤 Añadir mercader",
                    "👤 Eliminar mercader",
                    "👤 Modificar mercader",
                    "👤 Ver mercaderes",
                    "👤 Ordenar mercaderes",
                    "🤝 Registrar transacción",
                    "🤝 Eliminar transacción",
                    "🤝 Ver transacciones",
                    "🧾 Generar informes",
                    "🧾 Historial de transacciones por participante",
                    "❌ Salir",
                ],
            },
        ]);
        switch (option) {
            case "📦 Añadir bien":
                const { ID: idNuevo, Nombre: nombreNuevo } = await inquirer.prompt([
                    { type: "input", name: "ID", message: "ID del bien:" },
                    { type: "input", name: "Nombre", message: "Nombre del bien:" },
                ]);
                const bienPorID = inventario
                    .getStock()
                    .find((entry) => entry.item.id === idNuevo);
                const bienPorNombre = inventario
                    .getStock()
                    .find((entry) => entry.item.name.toLowerCase() === nombreNuevo.toLowerCase());
                if (bienPorID &&
                    bienPorNombre &&
                    bienPorID.item.id === bienPorNombre.item.id) {
                    console.log("Este bien ya existe en el inventario.");
                    const { cantidadExtra } = await inquirer.prompt([
                        {
                            type: "number",
                            name: "cantidadExtra",
                            message: "¿Cuántas unidades deseas añadir al stock existente?",
                        },
                    ]);
                    inventario.addItem(bienPorID.item, cantidadExtra);
                    console.log(`Se han añadido ${cantidadExtra} unidades al bien "${bienPorID.item.name}".`);
                }
                else if ((bienPorID &&
                    (!bienPorNombre || bienPorNombre.item.id !== idNuevo)) ||
                    (bienPorNombre && (!bienPorID || bienPorNombre.item.id !== idNuevo))) {
                    console.log("\nEl ID o el nombre ya existen, pero no coinciden correctamente entre sí.");
                    console.log("Asegúrate de introducir un ID y nombre que coincidan con un bien existente si deseas añadir al stock, o elige un ID y nombre únicos si es un bien nuevo.\n");
                }
                else {
                    const bienNuevo = await inquirer.prompt([
                        { type: "input", name: "Descripcion", message: "Descripción:" },
                        { type: "input", name: "Material", message: "Material:" },
                        { type: "number", name: "Peso", message: "Peso:" },
                        { type: "number", name: "Valor", message: "Valor en coronas:" },
                        { type: "number", name: "Cantidad", message: "Cantidad en stock:" },
                    ]);
                    const nuevoItem = new Item(idNuevo, nombreNuevo, bienNuevo.Descripcion, bienNuevo.Material, bienNuevo.Peso, bienNuevo.Valor);
                    inventario.addItem(nuevoItem, bienNuevo.Cantidad);
                    console.log("Bien añadido con éxito al inventario.");
                }
                break;
            case "📦 Eliminar bien":
                const { ID: idEliminar, Cantidad: cantidadEliminar } = await inquirer.prompt([
                    { type: "input", name: "ID", message: "ID del bien a eliminar:" },
                    {
                        type: "input",
                        name: "Cantidad",
                        message: "Cantidad a eliminar:",
                        validate: (value) => !isNaN(value) && value > 0,
                    },
                ]);
                const bienAEliminar = inventario
                    .getStock()
                    .find((entry) => entry.item.id === idEliminar);
                if (bienAEliminar) {
                    const resultado = inventario.removeItem(bienAEliminar.item.id, parseInt(cantidadEliminar));
                    if (resultado) {
                        console.log("Bien eliminado con éxito del inventario.");
                    }
                    else {
                        console.log("No se pudo eliminar la cantidad especificada del bien.");
                    }
                }
                else {
                    console.log("No se ha encontrado ningún bien con ese ID en el inventario.");
                }
                break;
            case "📦 Modificar bien":
                const { ID: idModificar } = await inquirer.prompt([
                    { type: "input", name: "ID", message: "ID del bien a modificar:" },
                ]);
                const bienAModificar = inventario
                    .getStock()
                    .find((entry) => entry.item.id === idModificar);
                if (bienAModificar) {
                    const nuevosDatos = await inquirer.prompt([
                        {
                            type: "input",
                            name: "Nombre",
                            message: "Nuevo nombre:",
                            default: bienAModificar.item.name,
                        },
                        {
                            type: "input",
                            name: "Descripcion",
                            message: "Nueva descripción:",
                            default: bienAModificar.item.description,
                        },
                        {
                            type: "input",
                            name: "Material",
                            message: "Nuevo material:",
                            default: bienAModificar.item.material,
                        },
                        {
                            type: "number",
                            name: "Peso",
                            message: "Nuevo peso:",
                            default: bienAModificar.item.weight,
                        },
                        {
                            type: "number",
                            name: "Valor",
                            message: "Nuevo valor en coronas:",
                            default: bienAModificar.item.value,
                        },
                        {
                            type: "number",
                            name: "Cantidad",
                            message: "Nueva cantidad en stock:",
                            default: bienAModificar.quantity,
                        },
                    ]);
                    const itemModificado = new Item(idModificar, nuevosDatos.Nombre, nuevosDatos.Descripcion, nuevosDatos.Material, nuevosDatos.Peso, nuevosDatos.Valor);
                    inventario.removeItem(bienAModificar.item.id, bienAModificar.quantity);
                    inventario.addItem(itemModificado, nuevosDatos.Cantidad);
                    console.log("Bien modificado con éxito.");
                }
                else {
                    console.log("No se ha encontrado ningún bien con ese ID en el inventario.");
                }
                break;
            case "📦 Ver bienes":
                const stock = inventario.getStock();
                if (stock.length === 0) {
                    console.log("No hay bienes en el inventario.");
                }
                else {
                    console.log("Bienes en el inventario:");
                    stock.forEach((entry, index) => {
                        console.log(`${index + 1}. ID: ${entry.item.id}, Nombre: ${entry.item.name}, Descripción: ${entry.item.description}, Material: ${entry.item.material}, Peso: ${entry.item.weight}, Valor: ${entry.item.value}, Cantidad: ${entry.quantity}`);
                    });
                }
                break;
            case "📦 Ordenar bienes":
                const { criterio, orden } = await inquirer.prompt([
                    {
                        type: "list",
                        name: "criterio",
                        message: "Seleccione el criterio de ordenación:",
                        choices: ["Nombre", "Valor", "Peso"],
                    },
                    {
                        type: "list",
                        name: "orden",
                        message: "Seleccione el orden:",
                        choices: ["Ascendente", "Descendente"],
                    },
                ]);
                const stockOrdenado = inventario.getStock().sort((a, b) => {
                    if (criterio === "Nombre") {
                        return orden === "Ascendente"
                            ? a.item.name.localeCompare(b.item.name)
                            : b.item.name.localeCompare(a.item.name);
                    }
                    else if (criterio === "Valor") {
                        return orden === "Ascendente"
                            ? a.item.value - b.item.value
                            : b.item.value - a.item.value;
                    }
                    else if (criterio === "Peso") {
                        return orden === "Ascendente"
                            ? a.item.weight - b.item.weight
                            : b.item.weight - a.item.weight;
                    }
                    return 0;
                });
                console.log("Bienes ordenados:");
                stockOrdenado.forEach((entry, index) => {
                    console.log(`${index + 1}. ID: ${entry.item.id}, Nombre: ${entry.item.name}, Valor: ${entry.item.value}, Peso: ${entry.item.weight}`);
                });
                break;
            case "👤 Añadir cliente":
                const { nombreCliente, idCliente, razaCliente, ubicacionCliente } = await inquirer.prompt([
                    {
                        type: "input",
                        name: "nombreCliente",
                        message: "Nombre del cliente:",
                    },
                    {
                        type: "input",
                        name: "idCliente",
                        message: "ID del cliente:",
                    },
                    {
                        type: "input",
                        name: "razaCliente",
                        message: "Raza del cliente:",
                    },
                    {
                        type: "input",
                        name: "ubicacionCliente",
                        message: "Ubicación del cliente:",
                    },
                ]);
                const clienteExistente = inventario
                    .getCustomers()
                    .find((cliente) => cliente.id === idCliente);
                if (clienteExistente) {
                    console.log(`Ya existe un cliente con el ID ${idCliente}.`);
                }
                else {
                    inventario.addCustomer({
                        id: idCliente,
                        name: nombreCliente,
                        race: razaCliente,
                        location: ubicacionCliente,
                    });
                    console.log("Cliente añadido con éxito.");
                }
                break;
            case "👤 Eliminar cliente":
                const { idClienteEliminar } = await inquirer.prompt([
                    {
                        type: "input",
                        name: "idClienteEliminar",
                        message: "ID del cliente a eliminar:",
                    },
                ]);
                const eliminado = inventario.removeCustomer(idClienteEliminar);
                if (eliminado) {
                    console.log("Cliente eliminado con éxito.");
                }
                else {
                    console.log("No se encontró ningún cliente con ese ID.");
                }
                break;
            case "👤 Modificar cliente":
                const { idClienteModificar } = await inquirer.prompt([
                    {
                        type: "input",
                        name: "idClienteModificar",
                        message: "ID del cliente a modificar:",
                    },
                ]);
                const clienteAModificar = inventario
                    .getCustomers()
                    .find((cliente) => cliente.id === idClienteModificar);
                if (clienteAModificar) {
                    const { nombreNuevo, razaNueva, ubicacionNueva } = await inquirer.prompt([
                        {
                            type: "input",
                            name: "nombreNuevo",
                            message: "Nuevo nombre:",
                            default: clienteAModificar.name,
                        },
                        {
                            type: "input",
                            name: "razaNueva",
                            message: "Nueva raza:",
                            default: clienteAModificar.race,
                        },
                        {
                            type: "input",
                            name: "ubicacionNueva",
                            message: "Nueva ubicación:",
                            default: clienteAModificar.location,
                        },
                    ]);
                    inventario.removeCustomer(idClienteModificar);
                    inventario.addCustomer({
                        id: idClienteModificar,
                        name: nombreNuevo,
                        race: razaNueva,
                        location: ubicacionNueva,
                    });
                    console.log("Cliente modificado con éxito.");
                }
                else {
                    console.log("No se encontró ningún cliente con ese ID.");
                }
                break;
            case "👤 Ver clientes":
                const clientes = inventario.getCustomers();
                if (clientes.length === 0) {
                    console.log("No hay clientes registrados.");
                }
                else {
                    console.log("Clientes registrados:");
                    clientes.forEach((cliente, index) => {
                        console.log(`${index + 1}. ID: ${cliente.id}, Nombre: ${cliente.name}, Raza: ${cliente.race}, Ubicación: ${cliente.location}`);
                    });
                }
                break;
            case "👤 Ordenar clientes":
                const { criterioCliente, ordenCliente } = await inquirer.prompt([
                    {
                        type: "list",
                        name: "criterioCliente",
                        message: "Seleccione el criterio de ordenación:",
                        choices: ["Nombre", "Raza"],
                    },
                    {
                        type: "list",
                        name: "ordenCliente",
                        message: "Seleccione el orden:",
                        choices: ["Ascendente", "Descendente"],
                    },
                ]);
                const clientesOrdenados = inventario.getCustomers().sort((a, b) => {
                    if (criterioCliente === "Nombre") {
                        return ordenCliente === "Ascendente"
                            ? a.name.localeCompare(b.name)
                            : b.name.localeCompare(a.name);
                    }
                    else if (criterioCliente === "Raza") {
                        return ordenCliente === "Ascendente"
                            ? a.race.localeCompare(b.race)
                            : b.race.localeCompare(a.race);
                    }
                    return 0;
                });
                console.log("Clientes ordenados:");
                clientesOrdenados.forEach((cliente, index) => {
                    console.log(`${index + 1}. ID: ${cliente.id}, Nombre: ${cliente.name}, Raza: ${cliente.race}, Ubicación: ${cliente.location}`);
                });
                break;
            case "👤 Añadir mercader":
                const { nombreMercader, idMercader, tipoMercader, ubicacionMercader } = await inquirer.prompt([
                    {
                        type: "input",
                        name: "nombreMercader",
                        message: "Nombre del mercader:",
                    },
                    {
                        type: "input",
                        name: "idMercader",
                        message: "ID del mercader:",
                    },
                    {
                        type: "input",
                        name: "tipoMercader",
                        message: "Tipo de mercader:",
                    },
                    {
                        type: "input",
                        name: "ubicacionMercader",
                        message: "Ubicación del mercader:",
                    },
                ]);
                const mercaderExistente = inventario
                    .getMerchants()
                    .find((mercader) => mercader.id === idMercader);
                if (mercaderExistente) {
                    console.log(`Ya existe un mercader con el ID ${idMercader}.`);
                }
                else {
                    inventario.addMerchant({
                        id: idMercader,
                        name: nombreMercader,
                        type: tipoMercader,
                        location: ubicacionMercader,
                    });
                    console.log("Mercader añadido con éxito.");
                }
                break;
            case "👤 Eliminar mercader":
                const { idMercaderEliminar } = await inquirer.prompt([
                    {
                        type: "input",
                        name: "idMercaderEliminar",
                        message: "ID del mercader a eliminar:",
                    },
                ]);
                const eliminadoMercader = inventario.removeMerchant(idMercaderEliminar);
                if (eliminadoMercader) {
                    console.log("Mercader eliminado con éxito.");
                }
                else {
                    console.log("No se encontró ningún mercader con ese ID.");
                }
                break;
            case "👤 Modificar mercader":
                const { idMercaderModificar } = await inquirer.prompt([
                    {
                        type: "input",
                        name: "idMercaderModificar",
                        message: "ID del mercader a modificar:",
                    },
                ]);
                const mercaderAModificar = inventario
                    .getMerchants()
                    .find((mercader) => mercader.id === idMercaderModificar);
                if (mercaderAModificar) {
                    const { nombreNuevo, tipoNuevo, ubicacionNueva } = await inquirer.prompt([
                        {
                            type: "input",
                            name: "nombreNuevo",
                            message: "Nuevo nombre:",
                            default: mercaderAModificar.name,
                        },
                        {
                            type: "input",
                            name: "tipoNuevo",
                            message: "Nuevo tipo:",
                            default: mercaderAModificar.type,
                        },
                        {
                            type: "input",
                            name: "ubicacionNueva",
                            message: "Nueva ubicación:",
                            default: mercaderAModificar.location,
                        },
                    ]);
                    inventario.removeMerchant(idMercaderModificar);
                    inventario.addMerchant({
                        id: idMercaderModificar,
                        name: nombreNuevo,
                        type: tipoNuevo,
                        location: ubicacionNueva,
                    });
                    console.log("Mercader modificado con éxito.");
                }
                else {
                    console.log("No se encontró ningún mercader con ese ID.");
                }
                break;
            case "👤 Ver mercaderes":
                const mercaderes = inventario.getMerchants();
                if (mercaderes.length === 0) {
                    console.log("No hay mercaderes registrados.");
                }
                else {
                    console.log("Mercaderes registrados:");
                    mercaderes.forEach((mercader, index) => {
                        console.log(`${index + 1}. ID: ${mercader.id}, Nombre: ${mercader.name}, Tipo: ${mercader.type}, Ubicación: ${mercader.location}`);
                    });
                }
                break;
            case "👤 Ordenar mercaderes":
                const { criterioMercader, ordenMercader } = await inquirer.prompt([
                    {
                        type: "list",
                        name: "criterioMercader",
                        message: "Seleccione el criterio de ordenación:",
                        choices: ["Nombre", "Tipo"],
                    },
                    {
                        type: "list",
                        name: "ordenMercader",
                        message: "Seleccione el orden:",
                        choices: ["Ascendente", "Descendente"],
                    },
                ]);
                const mercaderesOrdenados = inventario.getMerchants().sort((a, b) => {
                    if (criterioMercader === "Nombre") {
                        return ordenMercader === "Ascendente"
                            ? a.name.localeCompare(b.name)
                            : b.name.localeCompare(a.name);
                    }
                    else if (criterioMercader === "Tipo") {
                        return ordenMercader === "Ascendente"
                            ? a.type.localeCompare(b.type)
                            : b.type.localeCompare(a.type);
                    }
                    return 0;
                });
                console.log("Mercaderes ordenados:");
                mercaderesOrdenados.forEach((mercader, index) => {
                    console.log(`${index + 1}. ID: ${mercader.id}, Nombre: ${mercader.name}, Tipo: ${mercader.type}, Ubicación: ${mercader.location}`);
                });
                break;
            case "🤝 Registrar transacción":
                // quiero poder registrar una transaccion y que eso tenga efecto en el inventario, al vender o devoler se resta del inventario, al comprar se suma al inventario, puede ser la compra de un objeto que esta en el inventario u otro que no lo esté todavia, en cuyo caso habrá que añadir mas parametros para que se almacene el objeto correctamente.
                const { tipoTransaccion } = await inquirer.prompt([
                    {
                        type: "list",
                        name: "tipoTransaccion",
                        message: "Seleccione el tipo de transacción:",
                        choices: ["Venta", "Compra", "Devolución"],
                    },
                ]);
                const { idTransaccion, fechaTransaccion, idParticipante } = await inquirer.prompt([
                    {
                        type: "input",
                        name: "idTransaccion",
                        message: "ID de la transacción:",
                    },
                    {
                        type: "input",
                        name: "fechaTransaccion",
                        message: "Fecha de la transacción:",
                    },
                    {
                        type: "input",
                        name: "idParticipante",
                        message: "ID del participante:",
                    },
                ]);
                const participante = inventario
                    .getCustomers()
                    .find((cliente) => cliente.id === idParticipante) ||
                    inventario.getMerchants().find((mercader) => mercader.id === idParticipante);
                if (!participante) {
                    console.log("No se encontró ningún participante con ese ID.");
                    break;
                }
                const itemsTransaccion = [];
                while (true) {
                    const { idBien, cantidadBien } = await inquirer.prompt([
                        {
                            type: "input",
                            name: "idBien",
                            message: "ID del bien:",
                        },
                        {
                            type: "number",
                            name: "cantidadBien",
                            message: "Cantidad:",
                            validate: (value) => !isNaN(value) && value > 0,
                        },
                    ]);
                    const bien = inventario
                        .getStock()
                        .find((entry) => entry.item.id === idBien);
                    if (!bien) {
                        console.log("No se encontró ningún bien con ese ID.");
                        continue;
                    }
                    itemsTransaccion.push({ item: bien.item, quantity: cantidadBien });
                    const { añadirOtro } = await inquirer.prompt([
                        {
                            type: "confirm",
                            name: "añadirOtro",
                            message: "¿Desea añaadir otro bien a la transacción?",
                        },
                    ]);
                    if (!añadirOtro) {
                        break;
                    }
                }
                const totalAmount = itemsTransaccion.reduce((total, { item, quantity }) => total + item.value * quantity, 0);
                const resultado = transacciones.processTransaction(participante, itemsTransaccion, tipoTransaccion === "Venta" ? "sale" : tipoTransaccion === "Compra" ? "purchase" : "return");
                if (resultado) {
                    console.log("Transacción completada con éxito.");
                }
                else {
                    console.log("No se pudo completar la transacción.");
                }
                break;
            case "🤝 Eliminar transacción":
                const { idTransaccion2 } = await inquirer.prompt([
                    {
                        type: "input",
                        name: "idTransaccion2",
                        message: "Ingrese el ID de la transacción a eliminar:",
                    },
                ]);
                const eliminada = transacciones.removeTransaction(idTransaccion2);
                if (eliminada) {
                    console.log("Transacción eliminada con éxito.");
                }
                else {
                    console.log("No se encontró ninguna transacción con ese ID.");
                }
                break;
            case "🤝 Ver transacciones":
                const historialTransacciones = transacciones.getTransactionHistory();
                if (historialTransacciones.length === 0) {
                    console.log("No hay transacciones registradas.");
                }
                else {
                    console.log("Historial de transacciones:");
                    historialTransacciones.forEach((tx, index) => {
                        console.log(`${index + 1}. ID: ${tx.id}, Fecha: ${tx.date.toLocaleString()}, Tipo: ${tx.type}, Monto: ${tx.totalAmount} coronas, Participante: ${tx.participant.name || tx.participant.id}, Bienes: ${tx.items.map(({ item }) => item.name).join(", ")}`);
                    });
                }
                break;
            case "🧾 Generar informes":
                const { informe } = await inquirer.prompt([
                    {
                        type: "list",
                        name: "informe",
                        message: "Seleccione el informe a generar:",
                        choices: [
                            "Total de ingresos por ventas",
                            "Total de gastos por compras",
                            "Bienes más vendidos",
                        ],
                    },
                ]);
                switch (informe) {
                    case "Total de ingresos por ventas":
                        const totalIncome = transacciones.getTotalIncome();
                        console.log(`Total de ingresos por ventas: ${totalIncome} coronas.`);
                        break;
                    case "Total de gastos por compras":
                        const totalExpenses = transacciones.getTotalExpenses();
                        console.log(`Total de gastos por compras: ${totalExpenses} coronas.`);
                        break;
                    case "Bienes más vendidos":
                        const topSoldItems = transacciones.getTopSoldItems();
                        console.log("Bienes más vendidos:");
                        topSoldItems.forEach((entry, index) => {
                            console.log(`${index + 1}. ${entry.item.name} - Vendidos: ${entry.quantity}`);
                        });
                        break;
                }
                break;
            case "🧾 Historial de transacciones por participante":
                const { idParticipante2 } = await inquirer.prompt([
                    {
                        type: "input",
                        name: "idParticipante2",
                        message: "Ingrese el ID del participante:",
                    },
                ]);
                const historialParticipante = transacciones.getTransactionsHistoryByParticipant(idParticipante2);
                if (historialParticipante.length === 0) {
                    console.log("No hay transacciones registradas para ese participante.");
                }
                else {
                    console.log(`Historial de transacciones para el participante con ID ${idParticipante2}:`);
                    historialParticipante.forEach((tx, index) => {
                        console.log(`${index + 1}. ID: ${tx.id}, Fecha: ${tx.date.toLocaleString()}, Tipo: ${tx.type}, Monto: ${tx.totalAmount} coronas, Participante: ${tx.participant.name || tx.participant.id}, Bienes: ${tx.items.map(({ item, quantity }) => `${item.name} (x${quantity})`).join(", ")}`);
                    });
                }
                break;
            case "❌ Salir":
                console.log("Saliendo del sistema...");
                return;
        }
    }
}
