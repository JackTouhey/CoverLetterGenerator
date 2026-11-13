import { PDFParse } from 'pdf-parse';


export async function ExtractPdfContent(pdfBuffer: Buffer): Promise<string> {
    const parser = new PDFParse({ data: pdfBuffer });

    try {
        const parsedData = await parser.getText();

        return parsedData.text;

    } catch (error) {
        console.log("Error parsing PDF: ", error);
        return "Error parsing PDF :(";
    } finally {
        await parser.destroy();
    }
}