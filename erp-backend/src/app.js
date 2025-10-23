import express from 'express';
import { startScheduler } from './scheduler/scheduler.js';
import { syncPunchData } from './services/syncService.js';
import logger from './logger/logger.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Punch Sync Service is running');
});

// Start the sync service once at boot
syncPunchData().catch((e) => logger.error(`Initial sync failed: ${e.message}`));

// Start the scheduler for periodic data fetching
startScheduler();

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});