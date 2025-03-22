import { JSONFileSync  } from "lowdb/node";
import { LowSync } from "lowdb";
import { Schema } from "./schema.js";

// Inicializar Lowdb
export const db = new LowSync<Schema>(new JSONFileSync<Schema>('../db.json'));
db.read();
// para actualizar la base de datos, TOMAR EN CUENTA llamar a este método cada vez que realicemos cambios en el inventario o transacciones (ale)
export function saveData(data: Schema): void {
    db.data = data;
    db.write();
  }
// Si la base de datos está vacía, llenarla con datos iniciales
db.data = {
  bienes: [
    { id: "1", name: 'Espada de Acero', description: 'Buena para humanos', material: 'Acero', weight: 3.2, value: 250 },
    { id: "2", name: 'Espada de Plata', description: 'Útil contra monstruos', material: 'Plata', weight: 3.0, value: 500 },
    { id: "3", name: 'Elixir de Golondrina', description: 'Regenera salud', material: 'Hierbas místicas', weight: 0.5, value: 150 },
    { id: "4", name: 'Yelmo Encantado', description: 'Protección mágica', material: 'Acero encantado', weight: 2.8, value: 400 },
    { id: "5", name: 'Grimorio Antiguo', description: 'Contiene hechizos olvidados', material: 'Piel de basilisco', weight: 1.2, value: 600 },
    { id: "6", name: 'Daga de Cazador', description: 'Ideal para combate rápido', material: 'Acero de Mahakam', weight: 1.0, value: 180 },
    { id: "7", name: 'Armadura Ligera', description: 'Protección sin sacrificar movilidad', material: 'Cuero endurecido', weight: 5.5, value: 350 },
    { id: "8", name: 'Mutágenos de Necrófago', description: 'Útiles para alquimia', material: 'Extracto biológico', weight: 0.3, value: 200 },
    { id: "9", name: 'Runa de Igni', description: 'Mejora señales de fuego', material: 'Esencia mágica', weight: 0.8, value: 300 },
    { id: "10", name: 'Aguamiel de Skellige', description: 'Bebida fuerte para guerreros', material: 'Miel fermentada', weight: 2.0, value: 50 },
    { id: "11", name: 'Bolsa de Hierbas', description: 'Ingredientes para alquimia', material: 'Hierbas diversas', weight: 0.5, value: 80 },
    { id: "12", name: 'Ballesta de Caza', description: 'Útil contra enemigos voladores', material: 'Madera de fresno', weight: 4.2, value: 220 },
    { id: "13", name: 'Aceite para Espadas', description: 'Aumenta daño contra bestias', material: 'Extracto alquímico', weight: 0.6, value: 120 },
    { id: "14", name: 'Botas de Combate', description: 'Resistentes y cómodas', material: 'Cuero reforzado', weight: 2.5, value: 160 },
    { id: "15", name: 'Collar de Vampiro', description: 'Artefacto maldito', material: 'Plata oscura', weight: 0.7, value: 550 },
    { id: "16", name: 'Pergamino Arcano', description: 'Conocimiento mágico prohibido', material: 'Papel antiguo', weight: 0.4, value: 450 },
    { id: "17", name: 'Anillo de Protección', description: 'Otorga resistencia mágica', material: 'Ónix y plata', weight: 0.2, value: 380 },
    { id: "18", name: 'Escudo de Mahakam', description: 'Resistente a ataques pesados', material: 'Acero enano', weight: 6.0, value: 600 },
    { id: "19", name: 'Cuchillo de Arrojadizo', description: 'Silencioso y letal', material: 'Acero templado', weight: 0.9, value: 130 },
    { id: "20", name: 'Lámpara de Djinn', description: 'Artefacto con esencia mágica', material: 'Vidrio encantado', weight: 1.8, value: 750 }  
  ],
  mercaderes: [
    { id: "1", name: "Hattori", type: "Herrero", location: "Novigrado" },
    { id: "2", name: "Fergus Graem", type: "Herrero", location: "Velen" },
    { id: "3", name: "Tomira", type: "Alquimista", location: "Huerto Blanco" },
    { id: "4", name: "Marcus T.K. Hodgson", type: "Mercader general", location: "Novigrado" },
    { id: "5", name: "Éibhear Hattori", type: "Herrero", location: "Novigrado" },
    { id: "6", name: "Keira Metz", type: "Alquimista", location: "Bosque de Tretogor" },
    { id: "7", name: "Ibrahim Savi", type: "Mercader general", location: "Skellige" },
    { id: "8", name: "Otto Bamber", type: "Alquimista", location: "Novigrado" },
    { id: "9", name: "Yoana", type: "Herrera", location: "Velen" },
    { id: "10", name: "Roderick de Dun Tynne", type: "Mercader", location: "Toussaint" }
  ],
  clientes: [
    { id: "1", name: "Geralt de Rivia", race: "Brujo", location: "Kaer Morhen" },
    { id: "2", name: "Jaskier", race: "Humano", location: "Novigrado" },
    { id: "3", name: "Vesemir", race: "Brujo", location: "Kaer Morhen" },
    { id: "4", name: "Lambert", race: "Brujo", location: "Kaer Morhen" },
    { id: "5", name: "Eskel", race: "Brujo", location: "Kaer Morhen" },
    { id: "6", name: "Ciri", race: "Humana", location: "Nilfgaard" },
    { id: "7", name: "Yennefer de Vengerberg", race: "Hechicera", location: "Vengerberg" },
    { id: "8", name: "Triss Merigold", race: "Hechicera", location: "Novigrado" },
    { id: "9", name: "Zoltan Chivay", race: "Enano", location: "Novigrado" },
    { id: "10", name: "Roche", race: "Humano", location: "Temeria" }
  ]
};

// Guardar en db.json
db.write();

console.log(' Base de datos inicializada con éxito.');