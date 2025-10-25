const db = require('../db/db');
const logger = require('../logger/logger');

async function insertPunchData(punchData) {
    const client = await db.getConnection();
    const insertPunch = `
        INSERT INTO punch_data (emp_code, punch_time)
        VALUES ($1, $2)
        ON CONFLICT (emp_code, punch_time) DO NOTHING
    `;
    const upsertEmployee = `
        INSERT INTO employees (emp_code, name)
        VALUES ($1, COALESCE($2, $1))
        ON CONFLICT (emp_code) DO NOTHING
    `;

    let inserted = 0;
    let skipped = 0;

    try {
        await client.query('BEGIN');
        for (const rec of punchData) {
            try {
                // Ensure employee exists
                await client.query(upsertEmployee, [rec.emp_code, rec.name || null]);
                // Insert punch
                const res = await client.query(insertPunch, [rec.emp_code, rec.punch_time]);
                if (res.rowCount > 0) inserted++; else skipped++;
            } catch (e) {
                logger.error(`Insert failed for emp_code=${rec.emp_code} time=${rec.punch_time}: ${e.message}`);
            }
        }
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }

    return { fetched: punchData.length, inserted, skipped };
}

module.exports = { insertPunchData };