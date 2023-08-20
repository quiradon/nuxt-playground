import mysql from "mysql2"
const runtimeConfig = useRuntimeConfig()


const pool = mysql.createPool({
  host: runtimeConfig.dbHost,
  user: runtimeConfig.dbUser,
  database: runtimeConfig.dbName,
  password: runtimeConfig.dbPassword,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

function getItems(id) {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM `vw_items` WHERE `item_id` = ?', [id], function(err, rows, fields) {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

export default defineEventHandler(async (event) => {
  const {code} = event.context.params
  if (!Number(code)) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID must be a number",
    })
  }
  const items = await getItems(code);
  return items[0];
})