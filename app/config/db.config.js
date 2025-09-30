module.exports = {
  HOST: "localhost",
  USER: "cesar",
  PASSWORD: "12345",
  DB: "farmacia",
  dialect: "postgres",
    port: 5532,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};