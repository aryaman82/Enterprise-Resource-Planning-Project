const { fetchPunchData, formatApiDate } = require('../api/fetcher');
const { insertPunchData } = require('./dataInserter');
const db = require('../db/db');
const logger = require('../logger/logger');
const config = require('../config');

// Get MAX(punch_time) from DB
async function getLastPunchTimestamp() {
    const { rows } = await db.query('SELECT MAX(punch_time) AS last FROM punch_data');
    return rows[0]?.last ? new Date(rows[0].last) : null;
}

// Return IST-shifted date without external libs by applying +5:30 offset
function nowIST() {
    const now = new Date();
    // IST offset = +5:30 = 330 minutes
    const ist = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60000);
    return ist;
}

function addMinutesIST(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}

async function syncPunchData(options = {}) {
    try {
        // Decide window
        const last = await getLastPunchTimestamp();
        let fromIST;
        let toIST;
        const forceDays = Number(options.forceBackfillDays || 0);
        if (forceDays > 0) {
            // Force backfill window regardless of DB state
            toIST = nowIST();
            fromIST = addMinutesIST(toIST, -forceDays * 24 * 60);
        } else if (!last) {
            toIST = nowIST();
            fromIST = addMinutesIST(toIST, -config.initialBackfillDays * 24 * 60);
        } else {
            // Incremental window from last max - 5 minutes to now
            fromIST = addMinutesIST(new Date(last), -5);
            toIST = nowIST();
        }

        const Empcode = config.api.defaultEmpcode;
        const FromDate = formatApiDate(fromIST);
        const ToDate = formatApiDate(toIST);

    logger.info(`Sync window IST From=${FromDate} To=${ToDate}`);
    const records = await fetchPunchData({ empcode: Empcode, fromDate: FromDate, toDate: ToDate });
        const { fetched, inserted, skipped } = await insertPunchData(records);
        logger.stats({ fetched, inserted, skipped });
        return { fetched, inserted, skipped };
    } catch (error) {
        logger.error(`Sync failed: ${error.message}`);
        throw error;
    }
}

// Explicit date range sync (accepts JS Date or string 'YYYY-MM-DD' or formatted string)
async function syncPunchDataRange({ from, to, empcode } = {}) {
    try {
        if (!from || !to) throw new Error('Both from and to are required');

        const parseLoose = (val, endOfDay = false) => {
            if (val instanceof Date) return val;
            if (typeof val === 'string') {
                // Allow 'YYYY-MM-DD' and 'YYYY-MM-DDTHH:mm'
                const d = new Date(val);
                if (!isNaN(d.getTime())) {
                    if (endOfDay && val.length <= 10) {
                        // Set to 23:59 for date-only string
                        d.setHours(23, 59, 0, 0);
                    }
                    return d;
                }
            }
            throw new Error('Invalid date: ' + val);
        };

        const fromDate = parseLoose(from, false);
        const toDate = parseLoose(to, true);

        const Empcode = empcode || config.api.defaultEmpcode;
        const FromDate = formatApiDate(fromDate);
        const ToDate = formatApiDate(toDate);

        logger.info(`Range sync IST From=${FromDate} To=${ToDate}`);
        const records = await fetchPunchData({ empcode: Empcode, fromDate: FromDate, toDate: ToDate });
        const { fetched, inserted, skipped } = await insertPunchData(records);
        logger.stats({ fetched, inserted, skipped });
        return { fetched, inserted, skipped };
    } catch (error) {
        logger.error(`Range sync failed: ${error.message}`);
        throw error;
    }
}

module.exports = { syncPunchData, syncPunchDataRange };