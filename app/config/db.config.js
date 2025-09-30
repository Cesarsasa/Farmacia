module.exports = {
 HOST: "ep-odd-sunset-afe61qyu-pooler.c-2.us-west-2.aws.neon.tech",
  USER: "neondb_owner",
  PASSWORD: "npg_6Utp3cbqwXDn",
  DB: "neondb",
  dialect: "postgres",
    port: 5532,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};