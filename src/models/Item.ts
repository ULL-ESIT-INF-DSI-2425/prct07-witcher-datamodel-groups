/**
 * Representa un ítem dentro del sistema.
 */
export class Item {
  /**
   * Crea una nueva instancia de un ítem.
   * @param id - Identificador único del ítem.
   * @param name - Nombre del ítem.
   * @param description - Descripción del ítem.
   * @param material - Material del que está hecho el ítem.
   * @param weight - Peso del ítem en unidades de medida.
   * @param value - Valor o precio del ítem.
   */
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public material: string,
    public weight: number,
    public value: number,
  ) {}
}
