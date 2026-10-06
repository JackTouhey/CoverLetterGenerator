export class CoverLetter {
    id: number;
    name: string;
    fileId: string;
    isCv: boolean;

    constructor(id: number, name: string, fileId: string, isCv: boolean) {
        this.id = id;
        this.name = name;
        this.fileId = fileId;
        this.isCv = isCv;
    }
}