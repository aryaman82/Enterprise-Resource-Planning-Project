const axios = require('axios');
const config = require('../config');
const logger = require('../logger/logger');

// Helper to format FromDate/ToDate as DD/MM/YYYY_HH:mm (IST input expected)
function formatApiDate(date) {
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    const dd = pad(date.getDate());
    const mm = pad(date.getMonth() + 1);
    const yyyy = date.getFullYear();
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${dd}/${mm}/${yyyy}_${hh}:${min}`;
}

// Parse 'DD/MM/YYYY HH:mm:ss' string as IST and return naive 'YYYY-MM-DD HH:mm:ss'
function parseISTDateTime(ddmmyyyy_hhmmss) {
    const [datePart, timePart] = ddmmyyyy_hhmmss.trim().split(' ');
    const [d, m, y] = datePart.split('/').map(Number);
    const [H, M, S] = timePart.split(':').map(Number);
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    const istNaive = `${y}-${pad(m)}-${pad(d)} ${pad(H)}:${pad(M)}:${pad(S)}`;
    return istNaive;
}

async function fetchPunchData({ empcode, fromDate, toDate }) {
    const baseUrl = config.api.baseUrl;
    const Empcode = empcode || config.api.defaultEmpcode;
    const FromDate = typeof fromDate === 'string' ? fromDate : formatApiDate(fromDate);
    const ToDate = typeof toDate === 'string' ? toDate : formatApiDate(toDate);

    const url = `${baseUrl}?Empcode=${encodeURIComponent(Empcode)}&FromDate=${encodeURIComponent(FromDate)}&ToDate=${encodeURIComponent(ToDate)}`;

    const authToken = Buffer.from(`${config.api.username}:${config.api.password}`).toString('base64');

    try {
    logger.info(`Fetching punches: Empcode=${Empcode} FromDate=${FromDate} ToDate=${ToDate} auth=basic`);
        const response = await axios.get(url, {
            headers: {
        Authorization: `Basic ${authToken}`,
            },
            timeout: 60000,
        });

        let data = response.data;
        if (typeof data === 'string') {
            try { data = JSON.parse(data); } catch (e) { /* ignore */ }
        }
        const punchArray = Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data?.PunchData)
                    ? data.PunchData
                    : [];
        logger.info(`API responded status=${response.status} count=${punchArray.length}`);

        // Normalize for inserter: map to DB columns and include original fields
    return punchArray.map((rec) => {
            const punch_time = parseISTDateTime(rec.PunchDate);
            return {
                name: rec.Name || null,
                emp_code: rec.Empcode,
                punch_time, // IST naive timestamp for DB
                m_flag: rec.M_Flag ?? null,
                _raw: rec,
            };
        });
    } catch (error) {
        throw new Error(`Error fetching punch data: ${error.message}`);
    }
}

module.exports = {
    fetchPunchData,
    parseISTDateTime,
    formatApiDate,
};