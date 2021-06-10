module.exports = {
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    database: process.env.DB_SCHEMA,
    user: process.env.DB_USER_NAME,
    password: process.env.DB_PASSWORD,
  },
};
