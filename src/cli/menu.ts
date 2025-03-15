import inquirer from 'inquirer';
import { Inventario } from '../services/Inventario';

export async function iniciarInterfaz() { const 
  inventario = new Inventario(); 
  precargarDatos(inventario); while (true) {
    const { opcion } = await inquirer.prompt([ { 
        type: 'list', name: 'opcion', message: 
        'Seleccione una opción:', choices: [
          'Añadir bien', 'Eliminar bien', 
          'Modificar bien', 'Ver bienes', 
          'Añadir mercader', 'Eliminar 
          mercader', 'Modificar mercader', 'Ver 
          mercaderes', 'Añadir cliente', 
          'Eliminar cliente', 'Modificar 
          cliente', 'Ver clientes', 'Registrar 
          venta', 'Registrar compra', 'Registrar 
          devolución', 'Ver transacciones', 
          'Eliminar transacción', 'Salir'
        ],
      },
    ]); switch (opcion) { case 'Añadir bien': 
        const { ID: idNuevo, Nombre: nombreNuevo 
        } = await inquirer.prompt([
          { type: 'input', name: 'ID', message: 
          'ID del bien:' }, { type: 'input', 
          name: 'Nombre', message: 'Nombre del 
          bien:' }
        ]); const bienPorID = 
        inventario["bienes"].find(b => b.id === 
        idNuevo); const bienPorNombre = 
        inventario["bienes"].find(b => 
        b.nombre.toLowerCase() === 
        nombreNuevo.toLowerCase()); if 
        (bienPorID && bienPorNombre && 
        bienPorID.id === bienPorNombre.id) {
          console.log('Este bien ya existe en el 
          inventario.'); const { cantidadExtra } 
          = await inquirer.prompt([
            { type: 'number', name: 
            'cantidadExtra', message: '¿Cuántas 
            unidades deseas añadir al stock 
            existente?' }
          ]); 
          inventario.actualizarStock(bienPorID.id, 
          cantidadExtra); console.log(`Se han 
          añadido ${cantidadExtra} unidades al 
          bien "${bienPorID.nombre}".`);
        } else if ((bienPorID && !bienPorNombre) 
        } || (bienPorNombre && !bienPorID) || 
        } (bienPorID && bienPorNombre && 
        } bienPorID.id !== bienPorNombre.id)) {
          console.log('\n⚠️ El ID o el nombre ya 
          existen, pero no coinciden 
          correctamente entre sí.'); 
          console.log('Asegúrate de introducir 
          un ID y nombre que coincidan con un 
          bien existente si deseas añadir al 
          stock, o elige un ID y nombre únicos 
          si es un bien nuevo.\n');
        } else {
          const bienNuevo = await 
          inquirer.prompt([
            { type: 'input', name: 
            'Descripcion', message: 
            'Descripción:' }, { type: 'input', 
            name: 'Material', message: 
            'Material:' }, { type: 'number', 
            name: 'Peso', message: 'Peso:' }, { 
            type: 'number', name: 'Valor', 
            message: 'Valor en coronas:' }, { 
            type: 'number', name: 'Cantidad', 
            message: 'Cantidad en stock:' },
          ]); inventario.agregarBien(new Bien( 
            idNuevo, nombreNuevo, 
            bienNuevo.Descripcion, 
            bienNuevo.Material, bienNuevo.Peso, 
            bienNuevo.Valor, bienNuevo.Cantidad
          )); console.log('✅ Bien añadido con 
          éxito al inventario.');
        }
        break; case 'Eliminar bien': const { 
        idBienEliminar } = await 
        inquirer.prompt([
          { type: 'input', name: 
          'idBienEliminar', message: 'ID del 
          bien que deseas eliminar:' },
        ]); const bienEliminar = 
        inventario["bienes"].find(b => b.id === 
        idBienEliminar); if (!bienEliminar) {
          console.log('No se encontró un bien 
          con ese ID.'); break;
        }
        const { tipoEliminacion } = await 
        inquirer.prompt([
          { type: 'list', name: 
            'tipoEliminacion', message: `¿Deseas 
            eliminar completamente 
            "${bienEliminar.nombre}" o solo una 
            cantidad específica?`, choices: 
            ['Eliminar todo', 'Eliminar 
            cantidad'],
          }
        ]); if (tipoEliminacion === 'Eliminar 
        todo') {
          inventario.eliminarBien(idBienEliminar);
        } else {
          const { cantidadAEliminar } = await 
          inquirer.prompt([
            { type: 'number', name: 
              'cantidadAEliminar', message: 
              `¿Cuántas unidades deseas 
              eliminar? (Stock actual: 
              ${bienEliminar.cantidad})`,
            }
          ]); if (cantidadAEliminar > 0 && 
          cantidadAEliminar <= 
          bienEliminar.cantidad) {
            inventario.eliminarBien(idBienEliminar, 
            cantidadAEliminar);
          } else {
            console.log(`Cantidad inválida. Debe 
            ser un número mayor que 0 y menor o 
            igual a ${bienEliminar.cantidad}.`);
          }
        }
        break; case 'Modificar bien': const { 
        idModificar } = await inquirer.prompt([
          { type: 'input', name: 'idModificar', 
          message: 'ID del bien a modificar:' },
        ]); const bienModificar = 
        inventario["bienes"].find(b => b.id === 
        idModificar); if (!bienModificar) {
          console.log('No se encontró un bien 
          con ese ID.'); break;
        }
        const cambios = await inquirer.prompt([ 
          { type: 'input', name: 'nombre', 
          message: 'Nuevo nombre (dejar vacío 
          para no cambiar):', default: 
          bienModificar.nombre }, { type: 
          'input', name: 'descripcion', message: 
          'Nueva descripción:', default: 
          bienModificar.descripcion }, { type: 
          'input', name: 'material', message: 
          'Nuevo material:', default: 
          bienModificar.material }, { type: 
          'number', name: 'peso', message: 
          'Nuevo peso:', default: 
          bienModificar.peso }, { type: 
          'number', name: 'valor', message: 
          'Nuevo valor:', default: 
          bienModificar.valor }, { type: 
          'number', name: 'cantidad', message: 
          'Nueva cantidad:', default: 
          bienModificar.cantidad },
        ]); 
        inventario.modificarBien(idModificar, 
        cambios); break;
      case 'Ver bienes': 
        inventario.listarBienes(); break;
      case 'Añadir mercader': const mercader = 
        await inquirer.prompt([
          { type: 'input', name: 'ID', message: 
          'ID del mercader:' }, { type: 'input', 
          name: 'Nombre', message: 'Nombre del 
          mercader:' }, { type: 'input', name: 
          'Tipo', message: 'Tipo:' }, { type: 
          'input', name: 'Ubicacion', message: 
          'Ubicación:' }
        ]); const mercaderAgregar = 
        inventario["mercaderes"].find(b => b.id 
        === mercader.ID); if (mercaderAgregar) {
          console.log('Ya existe un mercader con 
          ese ID.'); break;
        }
        inventario.agregarMercader(new 
        Mercader(mercader.ID, mercader.Nombre, 
        mercader.Tipo, mercader.Ubicacion)); 
        console.log('Mercader añadido con 
        éxito.'); break;
      case 'Eliminar mercader': const { 
        idMercaderEliminar } = await 
        inquirer.prompt([
          { type: 'input', name: 
          'idMercaderEliminar', message: 'ID del 
          mercader que deseas eliminar:' },
        ]); const mercaderEliminar = 
        inventario["mercaderes"].find(b => b.id 
        === idMercaderEliminar); if 
        (!mercaderEliminar) {
          console.log('No se encontró un 
          mercader con ese ID.'); break;
        }
        inventario.eliminarMercader(idMercaderEliminar); 
        console.log('mercader eliminado con 
        éxito.'); break;
      case 'Modificar mercader': const { 
        idModificarMercader } = await 
        inquirer.prompt([
          { type: 'input', name: 
          'idModificarMercader', message: 'ID 
          del mercader a modificar:' },
        ]); const mercaderModificar = 
        inventario["mercaderes"].find(m => m.id 
        === idModificarMercader); if 
        (!mercaderModificar) {
          console.log('No se encontró un 
          mercader con ese ID.'); break;
        }
        const cambiosMercader = await 
        inquirer.prompt([
          { type: 'input', name: 'nombre', 
          message: 'Nuevo nombre (dejar vacío 
          para no cambiar):', default: 
          mercaderModificar.nombre }, { type: 
          'input', name: 'tipo', message: 'Nuevo 
          tipo:', default: 
          mercaderModificar.tipo }, { type: 
          'input', name: 'ubicacion', message: 
          'Nueva ubicación:', default: 
          mercaderModificar.ubicacion },
        ]); 
        inventario.modificarMercader(idModificarMercader, 
        cambiosMercader); break;
      case 'Ver mercaderes': 
        inventario.listarMercaderes(); break;
      case 'Añadir cliente': const cliente = 
        await inquirer.prompt([
          { type: 'input', name: 'ID', message: 
          'ID del cliente:' }, { type: 'input', 
          name: 'Nombre', message: 'Nombre del 
          cliente:' }, { type: 'input', name: 
          'Raza', message: 'Raza del cliente:' 
          },
          { type: 'input', name: 'Ubicacion', 
          message: 'Ubicación del cliente:' }
        ]); const clienteAgregar = 
        inventario["clientes"].find(c => c.id 
        === cliente.ID); if (clienteAgregar) {
          console.log('Ya existe un cliente con 
          ese ID.'); break;
        }
        inventario.agregarCliente(new 
        Cliente(cliente.ID, cliente.Nombre, 
        cliente.Raza, cliente.Ubicacion)); 
        console.log('Cliente añadido con 
        éxito.'); break;
      case 'Eliminar cliente': const { 
        idClienteEliminar } = await 
        inquirer.prompt([
          { type: 'input', name: 
          'idClienteEliminar', message: 'ID del 
          cliente que deseas eliminar:' },
        ]); const clienteEliminar = 
        inventario["clientes"].find(c => c.id 
        === idClienteEliminar); if 
        (!clienteEliminar) {
          console.log('No se encontró un cliente 
          con ese ID.'); break;
        }
        inventario.eliminarCliente(idClienteEliminar); 
        console.log('cliente eliminado con 
        éxito.'); break;
      case 'Modificar cliente': const { 
        idModificarCliente } = await 
        inquirer.prompt([
          { type: 'input', name: 
          'idModificarCliente', message: 'ID del 
          cliente a modificar:' },
        ]); const clienteModificar = 
        inventario["clientes"].find(c => c.id 
        === idModificarCliente); if 
        (!clienteModificar) {
          console.log('No se encontró un cliente 
          con ese ID.'); break;
        }
        const cambiosCliente = await 
        inquirer.prompt([
          { type: 'input', name: 'nombre', 
          message: 'Nuevo nombre (dejar vacío 
          para no cambiar):', default: 
          clienteModificar.nombre }, { type: 
          'input', name: 'raza', message: 'Nueva 
          raza:', default: clienteModificar.raza 
          },
          { type: 'input', name: 'ubicacion', 
          message: 'Nueva ubicación:', default: 
          clienteModificar.ubicacion },
        ]); 
        inventario.modificarCliente(idModificarCliente, 
        cambiosCliente); break;
      case 'Ver clientes': 
        inventario.listarClientes(); break;
      case 'Registrar venta': const { 
        IDClienteVenta } = await 
        inquirer.prompt([
          { type: 'input', name: 
          'IDClienteVenta', message: 'ID del 
          cliente:' },
        ]); const clienteVenta = 
        inventario["clientes"].find(c => c.id 
        === IDClienteVenta); if (!clienteVenta) 
        {
          console.log('No se encontró un cliente 
          con ese ID.'); break;
        }
        const bienesSeleccionados = await 
        inquirer.prompt([
          { type: 'checkbox', name: 'bienes', 
            message: 'Selecciona los bienes a 
            vender:', choices: 
            inventario["bienes"].map(b => ({ 
            name: `${b.nombre} (ID: ${b.id}, 
            cantidad: ${b.cantidad})`, value: b 
            })),
          },
        ]); const bienesVenta = []; for (const 
        bien of bienesSeleccionados.bienes) { 
        const { cantidad } = await 
        inquirer.prompt([
            { type: 'input', name: 'cantidad', 
              message: `Cantidad de 
              ${bien.nombre} (${bien.cantidad} 
              unidades disponibles):`, validate: 
              value => {
                const parsedValue = 
                Number(value); if 
                (isNaN(parsedValue) || 
                parsedValue <= 0) {
                  return 'Por favor ingrese un 
                  número válido mayor que 0';
                }
                if (parsedValue > bien.cantidad) 
                {
                  return `La cantidad ingresada 
                  excede la cantidad disponible 
                  (${bien.cantidad} unidades)`;
                }
                return true;
              },
            },
          ]); bienesVenta.push({ bien, cantidad: 
          parseInt(cantidad) });
        }
        const totalVenta = 
        bienesVenta.reduce((total, { bien, 
        cantidad }) => total + (bien.valor * 
        cantidad), 0); const transaccionVenta: 
        ITransaccion = {
          id: 
          `V${inventario["transacciones"].length 
          + 1}`, tipo: 'venta', fecha: new 
          Date(), cliente: clienteVenta, bienes: 
          bienesVenta.map(({ bien, cantidad }) 
          => ({ bien, cantidad })), total: 
          totalVenta,
        };
        inventario.registrarTransaccion(transaccionVenta); 
        for (const { bien, cantidad } of 
        bienesVenta) {
          const inventarioBienIndex = 
          inventario["bienes"].findIndex(b => 
          b.id === bien.id); if 
          (inventarioBienIndex !== -1) {
            if 
            (inventario["bienes"][inventarioBienIndex].cantidad 
            === cantidad) {
              inventario["bienes"].splice(inventarioBienIndex, 
              1);
            } else {
              inventario["bienes"][inventarioBienIndex].cantidad 
              -= cantidad;
            }
          }
        }
        console.log('Venta registrada con 
        éxito.'); break;
      case 'Registrar compra': const { 
        IDProveedorCompra } = await 
        inquirer.prompt([
          { type: 'input', name: 
          'IDProveedorCompra', message: 'ID del 
          proveedor:' },
        ]); const proveedorCompra = 
        inventario["mercaderes"].find(p => p.id 
        === IDProveedorCompra); if 
        (!proveedorCompra) {
          console.log('No se encontró un 
          proveedor con ese ID.'); break;
        }
        const { productoExistente } = await 
        inquirer.prompt([
          { type: 'confirm', name: 
            'productoExistente', message: '¿El 
            producto ya está en stock?',
          },
        ]); let bienesCompra = []; if 
        (productoExistente) {
          const bienesComprados = await 
          inquirer.prompt([
            { type: 'checkbox', name: 'bienes', 
              message: 'Selecciona los bienes a 
              comprar:', choices: 
              inventario["bienes"].map(b => ({ 
              name: `${b.nombre} (ID: ${b.id})`, 
              value: b })),
            },
          ]); for (const bien of 
          bienesComprados.bienes) {
            const { cantidad } = await 
            inquirer.prompt([ {
                type: 'input', name: 'cantidad', 
                message: `Cantidad de 
                ${bien.nombre} a comprar:`, 
                validate: value => {
                  const parsedValue = 
                  Number(value); if 
                  (isNaN(parsedValue) || 
                  parsedValue <= 0) {
                    return 'Por favor ingrese un 
                    número válido mayor que 0';
                  }
                  return true;
                },
              },
            ]); bienesCompra.push({ bien, 
            cantidad: parseInt(cantidad) });
          }
        } else {
          const nuevoBien = await 
          inquirer.prompt([
            { type: 'input', name: 'nombre', 
            message: 'Nombre del nuevo bien:' }, 
            { type: 'input', name: 'id', 
            message: 'ID del nuevo bien:' }, { 
            type: 'input', name: 'valor', 
            message: 'Valor del nuevo bien:', 
            validate: value => 
            !isNaN(Number(value)) && 
            Number(value) > 0 ? true : 'Por 
            favor ingrese un número válido mayor 
            que 0' }, { type: 'input', name: 
            'cantidad', message: 'Cantidad del 
            nuevo bien:', validate: value => 
            !isNaN(Number(value)) && 
            Number(value) > 0 ? true : 'Por 
            favor ingrese un número válido mayor 
            que 0' }, { type: 'input', name: 
            'descripcion', message: 'Descripción 
            del nuevo bien:' }, { type: 'input', 
            name: 'material', message: 'Material 
            del nuevo bien:' }, { type: 'input', 
            name: 'peso', message: 'Peso del 
            nuevo bien:', validate: value => 
            !isNaN(Number(value)) && 
            Number(value) > 0 ? true : 'Por 
            favor ingrese un número válido mayor 
            que 0' },
          ]); const bien = { nombre: 
            nuevoBien.nombre, id: nuevoBien.id, 
            valor: Number(nuevoBien.valor), 
            cantidad: 
            Number(nuevoBien.cantidad), 
            descripcion: nuevoBien.descripcion, 
            material: nuevoBien.material, peso: 
            Number(nuevoBien.peso),
          };
          bienesCompra.push({ bien, cantidad: 
          bien.cantidad });
        }
        const totalCompra = 
        bienesCompra.reduce((total, { bien, 
        cantidad }) => total + (bien.valor * 
        cantidad), 0); const transaccionCompra: 
        ITransaccion = {
          id: 
          `C${inventario["transacciones"].length 
          + 1}`, tipo: 'compra', fecha: new 
          Date(), proveedor: proveedorCompra, 
          bienes: bienesCompra.map(({ bien, 
          cantidad }) => ({ bien, cantidad })), 
          total: totalCompra,
        };
        inventario.registrarTransaccion(transaccionCompra); 
        for (const { bien, cantidad } of 
        bienesCompra) { const inventarioBien = 
        inventario["bienes"].find(b => b.id === 
        bien.id);
          if (inventarioBien) { 
            inventarioBien.cantidad += cantidad;
          } else {
            inventario["bienes"].push({ ...bien, 
            cantidad });
          }
        }
        console.log('Compra registrada con 
        éxito.'); break;
      case 'Ver transacciones': 
        inventario.listarTransacciones(); break;
      case 'Eliminar transacción': const { 
        IDTransaccion } = await 
        inquirer.prompt([
          { type: 'input', name: 
          'IDTransaccion', message: 'ID de la 
          transacción a eliminar:' },
        ]); 
        inventario.eliminarTransaccion(IDTransaccion); 
        console.log('transacción eliminada con 
        éxito.'); break;
      case 'Registrar devolución': const { 
        IDClienteDevolucion } = await 
        inquirer.prompt([
          { type: 'input', name: 
          'IDClienteDevolucion', message: 'ID 
          del cliente:' },
        ]); const clienteDevolucion = 
        inventario["clientes"].find(c => c.id 
        === IDClienteDevolucion); if 
        (!clienteDevolucion) {
          console.log('No se encontró un cliente 
          con ese ID.'); break;
        }
        const bienesSeleccionadosDevolucion = 
        await inquirer.prompt([
          { type: 'checkbox', name: 'bienes', 
            message: 'Selecciona los bienes a 
            devolver:', choices: 
            inventario["bienes"].map(b => ({ 
            name: `${b.nombre} (ID: ${b.id}, 
            cantidad: ${b.cantidad})`, value: b 
            })),
          },
        ]); const bienesDevolucion = []; for 
        (const bien of 
        bienesSeleccionadosDevolucion.bienes) {
          const { cantidad } = await 
          inquirer.prompt([
            { type: 'input', name: 'cantidad', 
              message: `Cantidad de 
              ${bien.nombre} (${bien.cantidad} 
              unidades disponibles):`, validate: 
              value => {
                const parsedValue = 
                Number(value); if 
                (isNaN(parsedValue) || 
                parsedValue <= 0) {
                  return 'Por favor ingrese un 
                  número válido mayor que 0';
                }
                if (parsedValue > bien.cantidad) 
                {
                  return `La cantidad ingresada 
                  excede la cantidad disponible 
                  (${bien.cantidad} unidades)`;
                }
                return true;
              },
            },
          ]); bienesDevolucion.push({ bien, 
          cantidad: parseInt(cantidad) });
        }
        const totalDevolucion = 
        bienesDevolucion.reduce((total, { bien, 
        cantidad }) => total + (bien.valor * 
        cantidad),
          0); const transaccionDevolucion: 
        ITransaccion = {
          id
          : `D${inventario["transacciones"].length 
          : + 1}`,
          tipo: 'devolución', fecha: new Date(), 
          cliente: clienteDevolucion, bienes: 
          bienesDevolucion.map(({ bien, cantidad 
          }) => ({ bien, cantidad })),
          total: totalDevolucion,
        };
        inventario.registrarTransaccion(transaccionDevolucion); 
        for (const { bien, cantidad } of 
        bienesDevolucion) {
          const inventarioBienIndex = 
          inventario["bienes"].findIndex(b => 
          b.id === bien.id); if 
          (inventarioBienIndex !== -1) {
            if 
            (inventario["bienes"][inventarioBienIndex].cantidad 
            === cantidad) {
              inventario["bienes"].splice(inventarioBienIndex, 
              1);
            } else {
              inventario["bienes"][inventarioBienIndex].cantidad 
              -= cantidad;
            }
          }
        }
        console.log('Devolución registrada con 
        éxito.'); break;
      case 'Salir': console.log('Saliendo del 
        sistema...'); return;
      }
  }
}
