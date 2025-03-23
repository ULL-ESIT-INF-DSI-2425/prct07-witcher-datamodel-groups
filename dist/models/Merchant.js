/**
 * Representa un comerciante dentro del sistema.
 */
export class Merchant {
    id;
    name;
    type;
    location;
    /**
     * Crea una nueva instancia de un comerciante.
     * @param id - Identificador único del comerciante.
     * @param name - Nombre del comerciante.
     * @param type - Tipo de comerciante (ej. vendedor, artesano, etc.).
     * @param location - Ubicación actual del comerciante.
     */
    constructor(id, name, type, location) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.location = location;
    }
}
