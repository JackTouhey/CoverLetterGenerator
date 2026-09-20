export class CoverLetter {
    id: number;
    name: string;
    fileId: string;

    constructor(id: number, name: string, fileId: string) {
        this.id = id;
        this.name = name;
        this.fileId = fileId;
    }
}