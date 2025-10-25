const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
    user: config.db.user,
    host: config.db.host,
    database: config.db.database,
    password: config.db.password,
    port: config.db.port,
});

const getConnection = () => pool.connect();
const query = (text, params) => pool.query(text, params);

module.exports = {
    getConnection,
    query,
    pool,
};