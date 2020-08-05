var mysql = require('mysql');

var connection = mysql.createConnection({
  host: "localhost",
  user: "usuario",
  password: "password",
  database: "db"
});

connection.connect(function(error) {
  if (error) throw error;
  console.log("Connected!");
  var sql = "INSERT INTO users (username, password) VALUES ('admin', 'admin')";
  connection.query(sql, function (error, result) {
    if (error) throw error;
    console.log("1 record inserted");
  });
});