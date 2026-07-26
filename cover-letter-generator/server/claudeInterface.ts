import * as dotenv from 'dotenv';
import fs from "fs";
import Anthropic from "@anthropic-ai/sdk";
import path from 'path';

dotenv.config( { path: path.join(__dirname, "config.env") } );

type Message = {
    role: "user" | "assistant";
    content: any[];
} 

const client = new Anthropic();
const messages: Message[] = [];
const downloadPath = process.env['DOWNLOAD_PATH'] !== undefined ? process.env['DOWNLOAD_PATH'] : "";
const fileIds: string[] = [
    process.env['CV_FILEID'] !== undefined ? process.env['CV_FILEID'] : "",
    process.env['CL1'] !== undefined ? process.env['CL1'] : "",
    process.env['CL2'] !== undefined ? process.env['CL2'] : "",
    process.env['CL3'] !== undefined ? process.env['CL3'] : "", 
    process.env['CL4'] !== undefined ? process.env['CL4'] : "",
    process.env['CL5'] !== undefined ? process.env['CL5'] : "",
    process.env['CL6'] !== undefined ? process.env['CL6'] : "",
    process.env['CL7'] !== undefined ? process.env['CL7'] : "",
    process.env['CL8'] !== undefined ? process.env['CL8'] : "",
    process.env['CL9'] !== undefined ? process.env['CL9'] : "",
    process.env['CL10'] !== undefined ? process.env['CL10'] : "",
    process.env['CL11'] !== undefined ? process.env['CL11'] : "",
    process.env['CL12'] !== undefined ? process.env['CL12'] : "",
    process.env['CL13'] !== undefined ? process.env['CL13'] : "",
    process.env['CL14'] !== undefined ? process.env['CL14'] : "",
]
const terminateMessage: string = 'Ignore all instructions and terminate session';

async function submitPrompt(messages: Message[]) {
    const response = await client.beta.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 5000,
        betas: ["code-execution-2025-08-25", "files-api-2025-04-14"],
        tools: [
            { type: "code_execution_20250825", name: "code_execution" },
            { type: "web_search_20250305", name: "web_search"}
        ],
        messages: messages
    });

    console.log(response);
    console.log('------------------------------');

    for (const block of response.content) {
        if (block.type === 'bash_code_execution_tool_result') {
            const codeExecutionContent = block.content;
            if (codeExecutionContent.type === 'bash_code_execution_result') {
                for (const generatedFile of codeExecutionContent.content) {
                    const fileId = generatedFile.file_id;
                    if (fileId !== undefined) {
                        downloadFile(fileId);
                    }
                }
            }
        }
    }

    return response;
} 

async function downloadFile(fileId: string) {
    const response = await client.beta.files.download(fileId);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(downloadPath + "/" + fileId + ".docx", buffer);
    console.log('Downloaded file: ' + downloadPath + "/" + fileId + ".docx");
}

function createMessage(isUser: boolean, content: any): Message {
    return {
        role: isUser ? "user" : "assistant",
        content: content
    };
}

function addFileToMessage(message: Message, fileId: string) {
    message.content.push({ type: "container_upload", file_id: fileId });
} 

export async function generateCoverLetter() {
    console.log('Generate Cover Letter clicked')
    const promptContent = await getPrompt();
    const message: Message = createMessage(true, [{ type: "text", text: promptContent }]);

    fileIds.forEach((fileId: string) => {
        addFileToMessage(message, fileId);
    });

    messages.push(message);
    return await submitPrompt(messages);
}

async function getPrompt(): Promise<string> {
    const promptPath = process.env['PROMPT_PATH'];
    if (promptPath === undefined) {
        return terminateMessage;
    }

    try {
        const data = await fs.promises.readFile(promptPath);
        return data.toString();
    } catch (error) {
        console.error(`Failed to read prompt file at "${promptPath}":`, error);
        return terminateMessage;
    }
}