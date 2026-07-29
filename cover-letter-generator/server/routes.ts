import express from 'express';
import { generateCoverLetter } from './claudeInterface';
import { testConnection } from './testConnection';

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

routes.get('/testConnection', async (req, res) => {
    try {
        console.log("http://localhost:4201/testConnection hit"); 

        await testConnection();

        res.send( {body: "Connection Successful"});
    } catch (error) {
        res.send( {body: "Connection Interrupted: " + (error as Error).message});
    }
});