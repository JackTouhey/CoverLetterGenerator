import express from 'express';
import { generateCoverLetter } from './claudeInterface';
export const routes = express.Router();
 
routes.post('/echo', (req, res) => {
    // console.log(req.body.contents); 
    res.send({ contents: req.body.contents });
});

routes.get('/generateCoverLetter', async (req, res) => {
    console.log("Submitting Cover Letter"); 

    const result = await generateCoverLetter();

    res.send( {body: result});
});