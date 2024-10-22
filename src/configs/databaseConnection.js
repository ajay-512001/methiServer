const Pool = require("pg").Pool;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "Methi",
    password: "Ajay@512001",
    port: "5432"
});

module.exports = pool;