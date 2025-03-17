export class Item {
    constructor(
      public readonly id: string,
      public name: string,
      public description: string,
      public material: string,
      public weight: number,
      public value: number
    ) {}
  }
  