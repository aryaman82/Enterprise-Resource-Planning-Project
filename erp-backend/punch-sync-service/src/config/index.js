const config = require('./config.json');

module.exports = {
    api: {
        baseUrl: config.api.baseUrl,
        username: config.api.username,
        password: config.api.password,
    defaultEmpcode: config.api.defaultEmpcode,
    },
    db: {
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        port: config.db.port,
    },
    timezone: config.timezone || 'Asia/Kolkata',
    initialBackfillDays: config.initialBackfillDays || 7,
    schedule: config.schedule || '*/5 * * * *'
};