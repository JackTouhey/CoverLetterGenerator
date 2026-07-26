import express from 'express';
export const routes = express.Router();
 
routes.get('/', (req, res) => res.send({ hello: 'world' }));
routes.get('/users', (req, res) => res.send([]));
routes.post('/echo', (req, res) => {
    // console.log(req.body.contents); 
    res.send({ contents: req.body.contents });
});