import express from 'express';
import { generateCoverLetter, uploadFile } from './claudeInterface';
import { testConnection } from './testConnection';
import { getCoverLetters, insertFileId } from './databaseInterface';
import multer from 'multer';

export const routes = express.Router();
const multerUpload = multer({ storage: multer.memoryStorage() });

routes.post('/generateCoverLetter', async (req, res) => {

    const fileIds: string[] = req.body.files;
    console.log(fileIds);
    // const result = await generateCoverLetter();
    const result = fileIds;

    res.status(200).json({ message: result });
});

routes.get('/getCoverLetters', async (req, res) => {
    console.log("getting Cover Letters"); 

    const result = await getCoverLetters();

    res.send( {body: result} );
});

routes.get('/testConnection', async (req, res) => {
    try {
        console.log("http://localhost:4201/testConnection hit"); 

        await testConnection();

        res.send( {body: "Connection Successful"});
    } catch (error) {
        res.send( {body: "Connection Interrupted: " + (error as Error).message});
    }
});

routes.post('/uploadFile', multerUpload.single('file'), async (req, res) => {
    if (req.file) {
        console.log('file name ', req.file.originalname);
        const response = await uploadFile(req.file);
        await insertFileId(response, req.file.originalname);
        res.status(200).json({ message: response });
    } else {
        res.status(200).json({ message: 'Not a file stinky' });
    }
});