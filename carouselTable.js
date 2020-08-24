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
    const sql = "CREATE TABLE carousel (id INT PRIMARY KEY AUTO_INCREMENT, deleted BOOLEAN, name CHAR(50) NOT NULL, image CHAR(50) NOT NULL)";
    connection.query(sql, function(error, result) {
        if(error) throw error;
        console.log("Table created");
    });
});