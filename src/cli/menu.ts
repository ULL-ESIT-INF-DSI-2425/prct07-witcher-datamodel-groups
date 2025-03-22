import { InventoryService } from '../services/InventoryService.js';
import { TransactionService } from '../services/TransactionService.js'; 
import { Item } from '../models/Item.js';
import inquirer from 'inquirer';

async function startInterface() {
  const inventario = new InventoryService()
  const transacciones = new TransactionService(inventario);
  console.log('Bienvenido al sistema de gestión de inventario.');
  while (true) {
    const { option } = await inquirer.prompt([
      {
        type: 'list',
        name: 'option',
        message: 'Seleccione una opción:',
        choices: [
          'Añadir bien', 'Eliminar bien', 'Ver bienes', 'Modificar bienes',
          'Registrar transacción', 'Ver transacciones', 'Ver resumen financiero',
          'Ver bienes más vendidos',
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
        const bienPorNombre = inventario.getStock().find(
          entry => entry.item.name.toLowerCase() === nombreNuevo.toLowerCase()
        );
      
        if (bienPorID && bienPorNombre && bienPorID.item.id === bienPorNombre.item.id) {
          console.log('Este bien ya existe en el inventario.');
          const { cantidadExtra } = await inquirer.prompt([
            { type: 'number', name: 'cantidadExtra', message: '¿Cuántas unidades deseas añadir al stock existente?' }
          ]);
          inventario.addItem(bienPorID.item, cantidadExtra);
          console.log(`Se han añadido ${cantidadExtra} unidades al bien "${bienPorID.item.name}".`);
      
        } else if ((bienPorID && (!bienPorNombre || bienPorNombre.item.id !== idNuevo)) ||
                   (bienPorNombre && (!bienPorID || bienPorNombre.item.id !== idNuevo))) {
          console.log('\nEl ID o el nombre ya existen, pero no coinciden correctamente entre sí.');
          console.log('Asegúrate de introducir un ID y nombre que coincidan con un bien existente si deseas añadir al stock, o elige un ID y nombre únicos si es un bien nuevo.\n');
      
        } else {
          const bienNuevo = await inquirer.prompt([
            { type: 'input', name: 'Descripcion', message: 'Descripción:' },
            { type: 'input', name: 'Material', message: 'Material:' },
            { type: 'number', name: 'Peso', message: 'Peso:' },
            { type: 'number', name: 'Valor', message: 'Valor en coronas:' },
            { type: 'number', name: 'Cantidad', message: 'Cantidad en stock:' },
          ]);
      
          const nuevoItem = new Item(
            idNuevo,
            nombreNuevo,
            bienNuevo.Descripcion,
            bienNuevo.Material,
            bienNuevo.Peso,
            bienNuevo.Valor
          );
      
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
          } else {
            console.log('No se pudo eliminar la cantidad especificada del bien.');
          }
        } else {
          console.log('No se ha encontrado ningún bien con ese ID en el inventario.');
        }
        break;
  
        case 'Modificar bien':
          const { ID: idModificar } = await inquirer.prompt([
            { type: 'input', name: 'ID', message: 'ID del bien a modificar:' }
          ]);
        
          const bienAModificar = inventario.getStock().find(entry => entry.item.id === idModificar);
          if (bienAModificar) {
            const nuevosDatos = await inquirer.prompt([
              { type: 'input', name: 'Nombre', message: 'Nuevo nombre:', default: bienAModificar.item.name },
              { type: 'input', name: 'Descripcion', message: 'Nueva descripción:', default: bienAModificar.item.description },
              { type: 'input', name: 'Material', message: 'Nuevo material:', default: bienAModificar.item.material },
              { type: 'number', name: 'Peso', message: 'Nuevo peso:', default: bienAModificar.item.weight },
              { type: 'number', name: 'Valor', message: 'Nuevo valor en coronas:', default: bienAModificar.item.value },
              { type: 'number', name: 'Cantidad', message: 'Nueva cantidad en stock:', default: bienAModificar.quantity }
            ]);
        
            const itemModificado = new Item(
              idModificar,
              nuevosDatos.Nombre,
              nuevosDatos.Descripcion,
              nuevosDatos.Material,
              nuevosDatos.Peso,
              nuevosDatos.Valor
            );
        
            inventario.removeItem(bienAModificar.item.id, bienAModificar.quantity);
            inventario.addItem(itemModificado, nuevosDatos.Cantidad);
            console.log('Bien modificado con éxito.');
          } else {
            console.log('No se ha encontrado ningún bien con ese ID en el inventario.');
          }
          break;

      case 'Ver bienes':
        const stock = inventario.getStock();
        if (stock.length === 0) {
          console.log('No hay bienes en el inventario.');
        } else {
          console.log('Bienes en el inventario:');
          stock.forEach((entry, index) => {
            console.log(`${index + 1}. ID: ${entry.item.id}, Nombre: ${entry.item.name}, Descripción: ${entry.item.description}, Material: ${entry.item.material}, Peso: ${entry.item.weight}, Valor: ${entry.item.value}, Cantidad: ${entry.quantity}`);
          });
        }
        break;

        
      case 'Ordenar bienes':
        const { criterio, orden } = await inquirer.prompt([
          {
            type: 'list',
            name: 'criterio',
            message: 'Seleccione el criterio de ordenación:',
            choices: ['Nombre', 'Valor', 'Peso'],
          },
          {
            type: 'list',
            name: 'orden',
            message: 'Seleccione el orden:',
            choices: ['Ascendente', 'Descendente'],
          },
        ]);

        const stockOrdenado = inventario.getStock().sort((a, b) => {
          if (criterio === 'Nombre') {
            return orden === 'Ascendente' ? a.item.name.localeCompare(b.item.name) : b.item.name.localeCompare(a.item.name);
          } else if (criterio === 'Valor') {
            return orden === 'Ascendente' ? a.item.value - b.item.value : b.item.value - a.item.value;
          } else if (criterio === 'Peso') {
            return orden === 'Ascendente' ? a.item.weight - b.item.weight : b.item.weight - a.item.weight;
          }
          return 0;
        });

        console.log('Bienes ordenados:');
        stockOrdenado.forEach((entry, index) => {
          console.log(`${index + 1}. ID: ${entry.item.id}, Nombre: ${entry.item.name}, Valor: ${entry.item.value}, Peso: ${entry.item.weight}`);
        });
        break;
      case 'Registrar transacción':
        const { tipo } = await inquirer.prompt([
          {
            type: 'list',
            name: 'tipo',
            message: 'Seleccione el tipo de transacción:',
            choices: ['Venta', 'Compra', 'Devolución'],
          },
        ]);
      
        const transactionType = tipo === 'Venta' ? 'sale' : tipo === 'Compra' ? 'purchase' : 'return';
      
        const { participante } = await inquirer.prompt([
          { type: 'input', name: 'participante', message: 'Nombre del participante (cliente o mercader):' }
        ]);
      
        let items = [];
        while (true) {
          const { idItem } = await inquirer.prompt([
            { type: 'input', name: 'idItem', message: 'ID del bien (deja vacío para finalizar):' }
          ]);
          if (!idItem) break;
      
          const bien = inventario.getStock().find(entry => entry.item.id === idItem);
          if (!bien) {
            console.log('Bien no encontrado.');
            continue;
          }
      
          const { cantidadNum } = await inquirer.prompt([
            { type: 'number', name: 'cantidadNum', message: `Cantidad de "${bien.item.name}":` }
          ]);
      
          items.push({ item: bien.item, quantity: cantidadNum });
        }
      
        if (items.length > 0) {
          const success = transacciones.processTransaction(participante, items, transactionType);
          console.log(success ? 'Transacción registrada con éxito.' : 'No se pudo completar la transacción.');
        } else {
          console.log('No se registraron bienes.');
        }
        break;
      
      case 'Ver transacciones':
        const historial = transacciones.getTransactionHistory();
        if (historial.length === 0) {
          console.log('No hay transacciones registradas.');
        } else {
          console.log('Historial de transacciones:');
          historial.forEach((tx, index) => {
            console.log(`${index + 1}. ID: ${tx.id}, Fecha: ${tx.date.toLocaleString()}, Tipo: ${tx.type}, Monto: ${tx.totalAmount} coronas, Participante: ${tx.participant}, Bienes: ${tx.items.map(item => `${item.name})`).join(', ')}`);
          });
        }
        break;

      case 'Ver bienes más vendidos':
        const ventas = transacciones.getTransactionHistory().filter(tx => tx.type === 'sale');
       
        const conteo: { [id: string]: { item: Item; cantidad: number } } = {};
        
        ventas.forEach(tx => {
          tx.items.forEach(item => {
            if (!conteo[item.id]) {
              conteo[item.id] = { item, cantidad: 1 };
            } else {
              conteo[item.id].cantidad += 1;
            }
          });
        });
        
        const vendidos = Object.values(conteo).sort((a, b) => b.cantidad - a.cantidad);
      
        if (vendidos.length === 0) {
          console.log('No hay registros de ventas aún.');
        } else {
          console.log('Bienes más vendidos:');
          vendidos.forEach(({ item, cantidad }, i) => {
            console.log(`${i + 1}. ${item.name} - Vendido ${cantidad} veces`);
          });
        }
        break;



        case 'Generar informes':
          const { informe } = await inquirer.prompt([
            {
              type: 'list',
              name: 'informe',
              message: 'Seleccione el informe a generar:',
              choices: [
                'Total de ingresos por ventas',
                'Total de gastos por compras',
                'Bienes más vendidos',
              ],
            },
          ]);
        
          switch (informe) {
            case 'Total de ingresos por ventas':
              const totalIncome = transacciones.getTotalIncome();
              console.log(`Total de ingresos por ventas: ${totalIncome} coronas.`);
              break;
        
            case 'Total de gastos por compras':
              const totalExpenses = transacciones.getTotalExpenses();
              console.log(`Total de gastos por compras: ${totalExpenses} coronas.`);
              break;
        
            case 'Bienes más vendidos':
              const topSoldItems = transacciones.getTopSoldItems();
              console.log('Bienes más vendidos:');
              topSoldItems.forEach((entry, index) => {
                console.log(`${index + 1}. ${entry.item.name} - Vendidos: ${entry.quantity}`);
              });
              break;
          }
          break;

          
      case 'Ver resumen financiero':
        let totalIngresos = 0;
        let totalGastos = 0;
    
        transacciones.getTransactionHistory().forEach(tx => {
          if (tx.type === 'sale') totalIngresos += tx.totalAmount;
          else if (tx.type === 'purchase') totalGastos += tx.totalAmount;
        });
    
        console.log(`Total de ingresos por ventas: ${totalIngresos} coronas`);
        console.log(`Total de gastos en adquisiciones: ${totalGastos} coronas`);
        console.log(`Balance neto: ${totalIngresos - totalGastos} coronas`);
        break;    

      case 'Salir':
        console.log('Saliendo del sistema...');
        return;
    }      
  }
}

startInterface();