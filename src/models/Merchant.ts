/**
 * Representa un comerciante dentro del sistema.
 */
export class Merchant {
  /**
   * Crea una nueva instancia de un comerciante.
   * @param id - Identificador único del comerciante.
   * @param name - Nombre del comerciante.
   * @param type - Tipo de comerciante (ej. vendedor, artesano, etc.).
   * @param location - Ubicación actual del comerciante.
   */
  constructor(
    public readonly id: string,
    public name: string,
    public type: string,
    public location: string,
  ) {}
}
