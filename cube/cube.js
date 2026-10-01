module.exports = {
  database: {
    type: `postgres`,
    host: `localhost`,
    port: 5432,
    database: `metricmind`,
    user: `metricmind`,
    password: process.env.CUBE_DB_PASSWORD
  }
};