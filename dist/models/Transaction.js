export class Transaction {
    id;
    date;
    items;
    totalAmount;
    participant;
    type;
    constructor(id, date, items, totalAmount, participant, type) {
        this.id = id;
        this.date = date;
        this.items = items;
        this.totalAmount = totalAmount;
        this.participant = participant;
        this.type = type;
    }
}
