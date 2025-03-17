export class Item {
    id;
    name;
    description;
    material;
    weight;
    value;
    constructor(id, name, description, material, weight, value) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.material = material;
        this.weight = weight;
        this.value = value;
    }
}
