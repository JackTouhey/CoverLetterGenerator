import express from 'express';
import { generateCoverLetter, uploadFile } from './claudeController';
import { getCoverLetters, insertFileId } from './databaseController';
import multer from 'multer';

export const routes = express.Router();
const multerUpload = multer({ storage: multer.memoryStorage() });

routes.post('/generateCoverLetter', async (req, res) => {

    const fileIds: string[] = req.body.files;
    console.log(fileIds);
    const blobs: Blob[] = await generateCoverLetter(fileIds);
    const files = await Promise.all(
        blobs.map(async b => Buffer.from(await b.arrayBuffer()).toString('base64'))
    );

    res.status(200).json({ files: files });
});

routes.get('/getCoverLetters', async (req, res) => {
    console.log("getting Cover Letters"); 

    const result = await getCoverLetters();

    res.send( {body: result} );
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