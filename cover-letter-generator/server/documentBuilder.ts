import { Document, Packer, Paragraph, TextRun } from "docx";

export async function buildDocumentsFromRoles(coverLetter: string): Promise<string> {
    const doc = new Document({
        sections: [
            {
                children: [
                    new Paragraph({
                        children: [new TextRun(coverLetter)],
                    }),
                ],
            },
        ],
    });
    return await Packer.toBase64String(doc);
}