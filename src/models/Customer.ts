/**
 * Representa un cliente dentro del sistema.
 */
export class Customer {
  /**
   * Crea una nueva instancia de un cliente.
   * @param id - Identificador único del cliente.
   * @param name - Nombre del cliente.
   * @param race - Raza del cliente.
   * @param location - Ubicación actual del cliente.
   */
  constructor(
    public readonly id: string,
    public name: string,
    public race: string,
    public location: string,
  ) {}
}
