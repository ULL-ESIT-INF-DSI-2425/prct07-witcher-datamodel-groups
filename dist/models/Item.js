/**
 * Representa un ítem dentro del sistema.
 */
export class Item {
    id;
    name;
    description;
    material;
    weight;
    value;
    /**
     * Crea una nueva instancia de un ítem.
     * @param id - Identificador único del ítem.
     * @param name - Nombre del ítem.
     * @param description - Descripción del ítem.
     * @param material - Material del que está hecho el ítem.
     * @param weight - Peso del ítem en unidades de medida.
     * @param value - Valor o precio del ítem.
     */
    constructor(id, name, description, material, weight, value) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.material = material;
        this.weight = weight;
        this.value = value;
    }
}
