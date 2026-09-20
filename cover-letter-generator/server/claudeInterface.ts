import dotenv from 'dotenv';
import fs from "fs";
import {Anthropic, toFile} from "@anthropic-ai/sdk";
import path from 'path';
import multer from 'multer';

dotenv.config( { path: path.join(__dirname, "config.env") } );

type Message = {
    role: "user" | "assistant";
    content: any[];
} 

const client = new Anthropic();
const messages: Message[] = [];
const downloadPath = process.env['DOWNLOAD_PATH'] !== undefined ? process.env['DOWNLOAD_PATH'] : "";
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

export async function generateCoverLetter(fileIds: string[]) {
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

export async function uploadFile(input: Express.Multer.File): Promise<string> {
    const uploadedFile = await client.beta.files.upload({
        file: await toFile(input.buffer, input.originalname, {
            type: input.mimetype,
        }),
    });
    return uploadedFile.id !== undefined ? uploadedFile.id : "id was not string :("; 
}