var { Pool } = require('pg');
let SM_EXAMPLE_DATABASE_CREDENTIALS = 'evsdevdb_secret';
const AWS = require('aws-sdk');
let secretsManager = new AWS.SecretsManager();

var pool = null;
async function pgConnection() {
    try {
        let sm = await secretsManager
            .getSecretValue({ SecretId: SM_EXAMPLE_DATABASE_CREDENTIALS })
            .promise();
        let credentials = JSON.parse(sm.SecretString);
        console.log("credentials::", credentials)
        pool = new Pool({
            user: credentials.username,
            host: credentials.host,
            database: credentials.dbname,
            password: credentials.password,
            port: credentials.port,
            max: 500,
            idleTimeoutMillis: 6000,
            allowExitOnIdle: true,
        });

        await pool.query('SELECT NOW()');

        return { pool };
    } catch (error) {
        throw error;
    }
};

export default pgConnection