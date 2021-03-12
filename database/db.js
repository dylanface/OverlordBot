require('dotenv').config();
const mysql = require('mysql2/promise');

let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
})
.then(() => console.log('Good'))
.catch(err => console.log(err));