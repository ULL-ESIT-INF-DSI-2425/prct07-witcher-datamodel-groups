import { InventoryService } from '../services/InventoryService.js';
import { Item } from '../models/Item.js';
import inquirer from 'inquirer';
async function startInterface() {
    const inventario = new InventoryService();
    console.log('Bienvenido al sistema de gestión de inventario.');
    while (true) {
        const { option } = await inquirer.prompt([
            {
                type: 'list',
                name: 'option',
                message: 'Seleccione una opción:',
                choices: [
                    'Añadir bien', 'Eliminar bien', 'Modificar bien', 'Ver bienes',
                    'Añadir mercader', 'Eliminar mercader', 'Modificar mercader', 'Ver mercaderes',
                    'Añadir cliente', 'Eliminar cliente', 'Modificar cliente', 'Ver clientes',
                    'Registrar venta', 'Registrar compra', 'Registrar devolución',
                    'Ver transacciones', 'Eliminar transacción',
                    'Salir'
                ],
            },
        ]);
        switch (option) {
            case 'Añadir bien':
                const { ID: idNuevo, Nombre: nombreNuevo } = await inquirer.prompt([
                    { type: 'input', name: 'ID', message: 'ID del bien:' },
                    { type: 'input', name: 'Nombre', message: 'Nombre del bien:' }
                ]);
                const bienPorID = inventario.getStock().find(entry => entry.item.id === idNuevo);
                const bienPorNombre = inventario.getStock().find(entry => entry.item.name.toLowerCase() === nombreNuevo.toLowerCase());
                if (bienPorID && bienPorNombre && bienPorID.item.id === bienPorNombre.item.id) {
                    console.log('Este bien ya existe en el inventario.');
                    const { cantidadExtra } = await inquirer.prompt([
                        { type: 'number', name: 'cantidadExtra', message: '¿Cuántas unidades deseas añadir al stock existente?' }
                    ]);
                    inventario.addItem(bienPorID.item, cantidadExtra);
                    console.log(`Se han añadido ${cantidadExtra} unidades al bien "${bienPorID.item.name}".`);
                }
                else if ((bienPorID && (!bienPorNombre || bienPorNombre.item.id !== idNuevo)) ||
                    (bienPorNombre && (!bienPorID || bienPorNombre.item.id !== idNuevo))) {
                    console.log('\n⚠️ El ID o el nombre ya existen, pero no coinciden correctamente entre sí.');
                    console.log('Asegúrate de introducir un ID y nombre que coincidan con un bien existente si deseas añadir al stock, o elige un ID y nombre únicos si es un bien nuevo.\n');
                }
                else {
                    const bienNuevo = await inquirer.prompt([
                        { type: 'input', name: 'Descripcion', message: 'Descripción:' },
                        { type: 'input', name: 'Material', message: 'Material:' },
                        { type: 'number', name: 'Peso', message: 'Peso:' },
                        { type: 'number', name: 'Valor', message: 'Valor en coronas:' },
                        { type: 'number', name: 'Cantidad', message: 'Cantidad en stock:' },
                    ]);
                    const nuevoItem = new Item(idNuevo, nombreNuevo, bienNuevo.Descripcion, bienNuevo.Material, bienNuevo.Peso, bienNuevo.Valor);
                    inventario.addItem(nuevoItem, bienNuevo.Cantidad);
                    console.log('Bien añadido con éxito al inventario.');
                }
                break;
            case 'Eliminar bien':
                const { ID: idEliminar, Cantidad: cantidadEliminar } = await inquirer.prompt([
                    { type: 'input', name: 'ID', message: 'ID del bien a eliminar:' },
                    { type: 'input', name: 'Cantidad', message: 'Cantidad a eliminar:', validate: value => !isNaN(value) && value > 0 }
                ]);
                const bienAEliminar = inventario.getStock().find(entry => entry.item.id === idEliminar);
                if (bienAEliminar) {
                    const resultado = inventario.removeItem(bienAEliminar.item.id, parseInt(cantidadEliminar));
                    if (resultado) {
                        console.log('Bien eliminado con éxito del inventario.');
                    }
                    else {
                        console.log('No se pudo eliminar la cantidad especificada del bien.');
                    }
                }
                else {
                    console.log('No se ha encontrado ningún bien con ese ID en el inventario.');
                }
                break;
            case 'Ver bienes':
                const stock = inventario.getStock();
                if (stock.length === 0) {
                    console.log('No hay bienes en el inventario.');
                }
                else {
                    console.log('Bienes en el inventario:');
                    stock.forEach((entry, index) => {
                        console.log(`${index + 1}. ID: ${entry.item.id}, Nombre: ${entry.item.name}, Descripción: ${entry.item.description}, Material: ${entry.item.material}, Peso: ${entry.item.weight}, Valor: ${entry.item.value}, Cantidad: ${entry.quantity}`);
                    });
                }
                break;
            case 'Salir':
                console.log('Saliendo del sistema...');
                return;
        }
    }
}
startInterface();
