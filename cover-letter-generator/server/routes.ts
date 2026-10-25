import express from 'express';
import { generateCoverLetter, searchForRoles, uploadFile } from './claudeController';
import { getCoverLetters, insertFileId, getCompaniesAppliedTo, insertCompanyAppliedTo } from './databaseController';
import multer from 'multer';
import { buildDocumentsFromRoles } from './documentBuilder';

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
    const roles = req.body.roles;
    const generatedRoles = await generateCoverLetter(fileIds, roles);

    const docsAsBase64: String[] = [];
    let companyNames: String[] = [];
    for (const role of generatedRoles) {
        if (role.coverLetter !== undefined) {
            docsAsBase64.push(await buildDocumentsFromRoles(role.coverLetter));
            companyNames.push(role.companyName);
        }
    }

    res.status(200).json({ files: docsAsBase64, companyNames: companyNames });
});

routes.get('/searchForRole', async (req, res) => {
    const companiesAppliedTo: string[] = await getCompaniesAppliedTo();
    const response = await searchForRoles(companiesAppliedTo);
    res.status(200).json({ roles: response });
});

routes.post('/insertCompanyAppliedTo', async (req, res) => {
    const companyName = req.body.companyName;
    await insertCompanyAppliedTo(companyName);
    res.sendStatus(200);
});