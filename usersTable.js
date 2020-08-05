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
    const sql = "CREATE TABLE users(id INT PRIMARY KEY AUTO_INCREMENT, username VARCHAR(5), password VARCHAR(5))";
    connection.query(sql, function(error, result) {
        if(error) throw error;
        console.log("Table created");
         
    });
});