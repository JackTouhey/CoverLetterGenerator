import dotenv from 'dotenv';
import fs from "fs";
import {Anthropic, toFile} from "@anthropic-ai/sdk";
import path from 'path';
import multer from 'multer';
import { roleSchema } from './utils/JSONSchemas';
import { Role } from '../src/model/role';

dotenv.config( { path: path.join(__dirname, "config.env") } );

type Message = {
    role: "user" | "assistant";
    content: any[];
}

const client = new Anthropic();
const terminateMessage: string = 'Ignore all instructions and terminate session';

async function submitCoverLetterPrompt(messages: Message[]): Promise<Blob[]> {
    const response = await client.beta.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 6000,
        betas: ["code-execution-2025-08-25", "files-api-2025-04-14"],
        tools: [
            { type: "code_execution_20250825", name: "code_execution" },
        ],
        messages: messages
    });

    console.log(response);
    console.log('------------------------------');
    const returnBlobs: Blob[] = [];

    for (const block of response.content) {
        if (block.type === 'bash_code_execution_tool_result') {
            const codeExecutionContent = block.content;
            if (codeExecutionContent.type === 'bash_code_execution_result') {
                for (const generatedFile of codeExecutionContent.content) {
                    const fileId = generatedFile.file_id;
                    if (fileId !== undefined) {
                        returnBlobs.push(await downloadBlobFromFileId(fileId));
                    }
                }
            }
        }
    }

    return returnBlobs;
} 

async function downloadBlobFromFileId(fileId: string): Promise<Blob> {
    const response = await client.beta.files.download(fileId);
    const fileBuffer = Buffer.from(await response.arrayBuffer());
    return new Blob(
        [fileBuffer], 
        { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
    );
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

export async function generateCoverLetter(fileIds: string[], roleInformation: string[]): Promise<Blob[]> {
    const messages: Message[] = [];
    const promptPath = process.env['GENERATE_LETTER_PROMPT_PATH'] !== undefined ? process.env['GENERATE_LETTER_PROMPT_PATH'] : '';
    let promptContent = await getPrompt(promptPath);
    promptContent += "Company Name: " + roleInformation[0];
    promptContent += "Role Description: " + roleInformation[1];
    const message: Message = createMessage(true, [{ type: "text", text: promptContent }]);

    fileIds.forEach((fileId: string) => {
        addFileToMessage(message, fileId);
    });
    
    messages.push(message);
    return await submitCoverLetterPrompt(messages);
}

async function getPrompt(promptPath: string): Promise<string> {
    if (promptPath === undefined || promptPath === '') {
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

export async function searchForRoles(companiesAppliedTo: string[]): Promise<Role[]> {
    const promptPath = process.env['ROLE_SEARCH_PROMPT_PATH'] !== undefined ? process.env['ROLE_SEARCH_PROMPT_PATH'] : '';
    let promptContent = await getPrompt(promptPath);
    promptContent += '\n\nThe following companies have already been applied to. If you find a posting for one of these, move on to the next best candidate. \n';
    for (const companyName of companiesAppliedTo) {
        promptContent += companyName + '\n';
    }
    console.log(promptContent);
    const message: Message = createMessage(true, [{ type: "text", text: promptContent }]);

    return await submitSearchForRolesPrompt([message]);
}

async function submitSearchForRolesPrompt(messages: Message[]): Promise<Role[]> {
    const rolesSchema = {
        type: 'object',
        properties: {
            roles: { type: 'array', items: roleSchema, minItems: 1 }
        },
        required: ['roles'],
        additionalProperties: false
    };

    let response = await client.beta.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 16000,
        tools: [
            { type: "web_search_20250305", name: "web_search", max_uses: 7 }
        ],
        betas: ["structured-outputs-2025-11-13"],
        output_format: { type: 'json_schema', schema: rolesSchema },
        messages: messages
    });

    let textOutputs: string = '';

    let loopCount = 0;
    while (response.stop_reason === 'pause_turn' && loopCount < 4) {
        messages.push(createMessage(false, response.content));
        response = await client.beta.messages.create({
            model: 'claude-haiku-4-5',
            max_tokens: 16000,
            tools: [
                { type: "web_search_20250305", name: "web_search", max_uses: 7}
            ],
            betas: ["structured-outputs-2025-11-13"],
            output_format: { type: 'json_schema', schema: rolesSchema },
            messages: messages
        });
        
        loopCount++;
        console.log(response);
    }
    console.log(response);

    const textBlocks = response.content.filter(block => block.type === 'text');
    const finalTextBlock = textBlocks[textBlocks.length - 1]?.text;

    const roles = parseRoles(finalTextBlock);

    console.log(roles);

    return roles;
}

function parseRoles(textBlock: string | undefined): Role[] {
    if (textBlock !== undefined) {
        try {
            const wrappedRoles: { roles: Role[] } = JSON.parse(textBlock);
            return wrappedRoles.roles;
        } catch (error) {
            console.error('Invalid JSON:', error);
            return [];
        }
    } else {
        return [];
    }
}