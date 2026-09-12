import express from 'express';
import { generateCoverLetter, uploadFile } from './claudeInterface';
import { testConnection } from './testConnection';
import multer from 'multer';

export const routes = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
 
routes.post('/echo', (req, res) => {
    // console.log(req.body.contents); 
    res.send({ contents: req.body.contents });
});

routes.get('/generateCoverLetter', async (req, res) => {
    console.log("Submitting Cover Letter"); 

    const result = await generateCoverLetter();

    res.send( {body: result});
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

routes.post('/uploadFile', upload.single('file'), async (req, res) => {
    if (req.file) {
        const response = await uploadFile(req.file);
        res.status(200).json({ message: response });
    } else {
        res.status(200).json({ message: 'Not a file stinky' });
    }
});