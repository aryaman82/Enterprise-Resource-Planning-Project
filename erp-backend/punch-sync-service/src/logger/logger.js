const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'app.log');

function write(line) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${line}\n`;
    try {
        fs.appendFileSync(logFilePath, logEntry, 'utf8');
    } catch (e) {
        // Fallback to console if file write fails
        console.error('Log write failed:', e.message);
        console.log(logEntry);
    }
}

function info(msg) {
    write(`INFO  ${msg}`);
}

function error(msg) {
    write(`ERROR ${msg}`);
}

function stats({ fetched = 0, inserted = 0, skipped = 0 } = {}) {
    write(`STATS fetched=${fetched} inserted=${inserted} skipped=${skipped}`);
}

module.exports = {
    info,
    error,
    stats,
};