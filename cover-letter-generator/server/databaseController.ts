import pool from './utils/connectionPool';
import { CoverLetter } from '../src/model/coverLetter';

export async function insertFile(aFileName: String, isCv: boolean, aFileText: string) {
    const query = {
        name: 'insertFile',
        text: 'INSERT INTO file_ids (file_name, is_cv, file_text) VALUES ($1, $2, $3)',
        values: [aFileName, isCv, aFileText]
    };

    try {
        console.log('Attempting to insert file ', aFileName);
        await pool.query(query);
    } catch (error) {
        console.error('Connection failed:', (error as Error).message);
    } 
}

export async function getCoverLetters(): Promise<CoverLetter[]> {
    const query = {
        name: 'getCoverLetters',
        text: 'SELECT id, file_name as name, is_cv as "isCv" FROM file_ids',
    };

    try {
        const result = await pool.query<CoverLetter>(query);
        return result.rows;
    } catch (error) {
        console.error('Connection failed:', (error as Error).message);
        return [];
    }
}

export async function getCompaniesAppliedTo(): Promise<string[]> {
    const query = {
        name: 'getCompanies',
        text: 'SELECT company_name as "companyName" FROM companies_applied_to'
    };

    try {
        const result = await pool.query<{ companyName: string }>(query);
        return result.rows.map(row => row.companyName);
    } catch (error) {
        console.error('Connection failed:', (error as Error).message);
        return [];
    }
}

export async function insertCompanyAppliedTo(aCompanyName: String) {
    const query = {
        name: 'insertCompany',
        text: 'INSERT INTO companies_applied_to (company_name) VALUES ($1)',
        values: [aCompanyName]
    };

    try {
        console.log('Attempting to insert file ', aCompanyName);
        await pool.query(query);
    } catch (error) {
        console.error('Connection failed:', (error as Error).message);
    } 
}