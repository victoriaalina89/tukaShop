const mysql = require('mysql');

const connection = mysql.createConnection( {
    host : "localhost",
    user : "usuario",
    password: "password"
});

connection.connect(function(error) {
    if(error) throw error;
    console.log("connected");
    connection.query("CREATE DATABASE db", function(error, result) {
        if(error) throw error;
        console.log("Database created");
    });
});