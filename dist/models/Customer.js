/**
 * Representa un cliente dentro del sistema.
 */
export class Customer {
    id;
    name;
    race;
    location;
    /**
     * Crea una nueva instancia de un cliente.
     * @param id - Identificador único del cliente.
     * @param name - Nombre del cliente.
     * @param race - Raza del cliente.
     * @param location - Ubicación actual del cliente.
     */
    constructor(id, name, race, location) {
        this.id = id;
        this.name = name;
        this.race = race;
        this.location = location;
    }
}
