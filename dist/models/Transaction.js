/**
 * Representa una transacción dentro del sistema.
 */
export class Transaction {
    id;
    date;
    items;
    totalAmount;
    participant;
    type;
    /**
     * Crea una nueva instancia de una transacción.
     * @param id - Identificador único de la transacción.
     * @param date - Fecha en la que se realizó la transacción.
     * @param items - Lista de ítems y cantidades involucrados en la transacción.
     * @param totalAmount - Monto total de la transacción.
     * @param participant - Participante de la transacción (comerciante o cliente).
     * @param type - Tipo de transacción (compra, venta o devolución).
     */
    constructor(id, date, items, totalAmount, participant, type) {
        this.id = id;
        this.date = date;
        this.items = items;
        this.totalAmount = totalAmount;
        this.participant = participant;
        this.type = type;
    }
}
