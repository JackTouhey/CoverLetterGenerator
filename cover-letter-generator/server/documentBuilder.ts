import { Document, ExternalHyperlink, Header, HorizontalPositionRelativeFrom, ImageRun, Packer, Paragraph, TextRun, TextWrappingType, VerticalPositionRelativeFrom } from "docx";
import { ShapeRun } from "docx/shapes";

const FONT = "Calibri";
const SIDEBAR_COLOUR = "DAE3F3";
const SIDEBAR_WIDTH_PX = 105;
const SIDEBAR_HEIGHT_PX = 1135;

interface Contact {
    name: string;
    location: string;
    phone: string;
    email: string;
}

export const JACK: Contact = {
    name: "Jack Touhey",
    location: "Maroochydore, Sunshine Coast QLD 4558",
    phone: "0460 634 093",
    email: "jctouhey@gmail.com",
};

function sidebarBar(): Paragraph {
    return new Paragraph({
        spacing: { before: 0, after: 0, line: 240 },
        children: [
            new ShapeRun({
                type: "rectangle",
                transformation: { width: SIDEBAR_WIDTH_PX, height: SIDEBAR_HEIGHT_PX },
                fill: SIDEBAR_COLOUR,
                line: "none",
                floating: {
                horizontalPosition: {
                    relative: HorizontalPositionRelativeFrom.PAGE,
                    offset: 0,
                },
                verticalPosition: {
                    relative: VerticalPositionRelativeFrom.PAGE,
                    offset: 0,
                },
                behindDocument: true,
                allowOverlap: true,
                lockAnchor: true,
                wrap: { type: TextWrappingType.NONE },
                },
            }),
        ],
    });
}

function sidebarHeader(): Header {
    return new Header({ children: [sidebarBar()] });
}

function nameParagraph(name: string): Paragraph {
    return new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [
            new TextRun({ text: name, font: FONT, bold: true, size: 36 }), 
        ],
    });
}

function contactParagraph(contactDetails: Contact): Paragraph {
    const size = 20; // 10pt
    const plain = (text: string) => new TextRun({ text, font: FONT, size });

    return new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [
            plain(`${contactDetails.location} | ${contactDetails.phone} | `),
            new ExternalHyperlink({
                link: `mailto:${contactDetails.email}`,
                children: [
                    new TextRun({
                        text: contactDetails.email,
                        font: FONT,
                        size,
                        color: "0563C1",
                        underline: {},
                    }),
                ],
            }),
        ],
    });
}

function spacerParagraph(): Paragraph {
    return new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: "", font: FONT, size: 20 })],
    });
}

function nameAndContactBlock(c: Contact = JACK): Paragraph[] {
    return [
        nameParagraph(c.name),
        contactParagraph(c),
        spacerParagraph(),
        spacerParagraph(),
    ];
}

const PAGE = {
    size: { width: 11906, height: 16838 }, 
    margin: { top: 720, left: 1793, right: 1134, bottom: 1134, header: 0 },
};

export async function buildDocumentsFromRoles(coverLetter: string): Promise<string> {
    const lines = coverLetter.split(/\r?\n/);
    const runs = lines.map((line, index) =>
        new TextRun({ text: line, break: index === 0 ? 0 : 1 })
    );

    const doc = new Document({
        styles: { default: { document: { run: { font: FONT, size: 24 } } } },
        sections: [
            {
                properties: { page: PAGE },
                headers: { default: sidebarHeader() },
                children: [
                    ...nameAndContactBlock(),
                    new Paragraph({
                        children: runs,
                    }),
                ],
            },
        ],
    });
    return await Packer.toBase64String(doc);
}