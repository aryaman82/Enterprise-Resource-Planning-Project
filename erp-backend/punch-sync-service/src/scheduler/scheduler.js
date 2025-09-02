const cron = require('node-cron');
const { syncPunchData } = require('../services/syncService');
const logger = require('../logger/logger');
const config = require('../config');

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

module.exports = { startScheduler };