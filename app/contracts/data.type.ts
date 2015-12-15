module Data {
    export class Type {
        name: string;
        grokitName: string;
        nullable: boolean;

        constructor(name: string, grokitName: string) {
            this.name = name;
            this.grokitName = grokitName;
        }
    }
}
