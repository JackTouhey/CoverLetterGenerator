import pool from './utils/connectionPool';
import { CoverLetter } from '../src/model/coverLetter';

export async function insertFileId(aFileId: String, aFileName: String) {
    const query = {
        name: 'insertFile',
        text: 'INSERT INTO file_ids (file_id, file_name) VALUES ($1, $2)',
        values: [aFileId, aFileName]
    };

    try {
        console.log('Attempting to insert file ', aFileId);
        await pool.query(query);
    } catch (error) {
        console.error('Connection failed:', (error as Error).message);
    } 
}

export async function getCoverLetters(): Promise<CoverLetter[]> {
    const query = {
        name: 'getCoverLetters',
        text: 'SELECT id, file_id as fileId, file_name as name FROM file_ids',
    };

    try {
        const result = await pool.query<CoverLetter>(query);
        return result.rows;
    } catch (error) {
        console.error('Connection failed:', (error as Error).message);
        return [];
    }
}