import { Pool } from "pg";
import dotenv from 'dotenv';
import path from 'path';


dotenv.config( { path: path.join(__dirname, "../config.env") } );

const HOST = process.env.HOST;
const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;
const DBNAME = process.env.DBNAME;
const defaultPort = 42069;
const PORT = process.env.PORT === undefined ? defaultPort : Number.parseInt(process.env.PORT);

const pool = new Pool({
    user: USER,
    host: HOST,
    database: DBNAME,
    password: PASSWORD,
    port: PORT,
});

export default pool;