import { Document, Packer, Paragraph, TextRun } from "docx";

export async function buildDocumentsFromRoles(coverLetter: string): Promise<string> {
    const lines = coverLetter.split(/\r?\n/);
    const runs = lines.map((line, index) =>
        new TextRun({ text: line, break: index === 0 ? 0 : 1 })
    );

    const doc = new Document({
        sections: [
            {
                children: [
                    new Paragraph({
                        children: runs,
                    }),
                ],
            },
        ],
    });
    return await Packer.toBase64String(doc);
}