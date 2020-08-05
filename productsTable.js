const mysql = require("mysql");

const connection = mysql.createConnection( {
    host: "localhost",
    user: "usuario",
    password: "password",
    database: "db"
});

connection.connect(function(error){
    if(error) throw error;
    console.log("connected");
    const sql = "CREATE TABLE products (id INT PRIMARY KEY AUTO_INCREMENT, deleted BOOLEAN, name VARCHAR(30), description VARCHAR(600), image BLOB, UNIQUE KEY(name))";
    connection.query(sql, function(error, result) {
        if(error) throw error;
        console.log("Table created");
    });
});