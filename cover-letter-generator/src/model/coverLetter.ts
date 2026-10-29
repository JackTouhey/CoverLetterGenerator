export class CoverLetter {
    id: number;
    name: string;
    text: string;
    isCv: boolean;

    constructor(id: number, name: string, text: string, isCv: boolean) {
        this.id = id;
        this.name = name;
        this.text = text;
        this.isCv = isCv;
    }
}