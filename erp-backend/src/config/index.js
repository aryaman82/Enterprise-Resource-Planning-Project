import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.join(__dirname, 'config.json');
let raw = {};
try {
    raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
} catch (e) {
    console.error('Failed to read config.json:', e.message);
}

const cfg = {
    api: {
        baseUrl: raw.api?.baseUrl,
        username: raw.api?.username,
        password: raw.api?.password,
        defaultEmpcode: raw.api?.defaultEmpcode,
    },
    timezone: raw.timezone || 'Asia/Kolkata',
    initialBackfillDays: raw.initialBackfillDays || 7,
    schedule: raw.schedule || '*/5 * * * *',
};

export default cfg;