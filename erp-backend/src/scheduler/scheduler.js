import cron from 'node-cron';
import { syncPunchData } from '../services/syncService.js';
import logger from '../logger/logger.js';
import config from '../config/index.js';

let started = false;

function startScheduler() {
    if (started) {
        logger.info('Scheduler already started; skipping re-init.');
        return;
    }
    started = true;
    cron.schedule(config.schedule, async () => {
        try {
            const res = await syncPunchData();
            logger.info(`Scheduled sync OK. Inserted=${res.inserted}, Skipped=${res.skipped}`);
        } catch (error) {
            logger.error('Scheduled sync failed: ' + error.message);
        }
    });
    logger.info(`Scheduler initialized. Cron=${config.schedule}`);
}

export { startScheduler };

export default { startScheduler };