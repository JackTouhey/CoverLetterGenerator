import express from 'express';
import { generateCoverLetter, searchForRoles, uploadFile } from './claudeController';
import { getCoverLetters, insertFileId, getCompaniesAppliedTo, insertCompanyAppliedTo } from './databaseController';
import multer from 'multer';

export const routes = express.Router();
const multerUpload = multer({ storage: multer.memoryStorage() });

routes.get('/getCoverLetters', async (req, res) => {
    console.log("getting Cover Letters"); 

    const result = await getCoverLetters();

    res.send( {body: result} );
});

routes.post('/uploadFile', multerUpload.single('file'), async (req, res) => {
    if (req.file) {
        console.log('file name ', req.file.originalname);
        const response = await uploadFile(req.file);
        const isCv = req.body.isCv === 'true';
        await insertFileId(response, req.file.originalname, isCv);
        res.status(200).json({ message: response });
    } else {
        res.status(200).json({ message: 'Not a file stinky' });
    }
});

routes.post('/generateCoverLetter', async (req, res) => {
    const fileIds: string[] = req.body.files;
    const roleInformation = req.body.roleInformation;
    const blobs: Blob[] = await generateCoverLetter(fileIds, roleInformation);
    const files = await Promise.all(
        blobs.map(async b => Buffer.from(await b.arrayBuffer()).toString('base64'))
    );

    res.status(200).json({ files: files });
});

routes.get('/searchForRole', async (req, res) => {
    const companiesAppliedTo: string[] = await getCompaniesAppliedTo();
    const response = await searchForRoles(companiesAppliedTo);
    res.status(200).json({ company: response[0], description: response[1], url: response[2] });
});