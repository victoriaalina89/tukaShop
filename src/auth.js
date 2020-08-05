module.exports.isAuthorized  = function(request, response, next) {

    var mysql = require('mysql');

    var connection = mysql.createConnection({
    host: "localhost",
    user: "usuario",
    password: "password",
    database: "db"
    });

    connection.connect(function(error) {
    if (error) throw error;
    connection.query("SELECT * FROM users", function (error, users, fields) {
        if (error) throw error;
        if(request.body.username === users[0].username && request.body.password === users[0].password) {
           
            request.session.admin = true;
            return next();
            
           
        } else {
           
            response.redirect('/admin/invalid-login');
        }
    });
    });

    // User.findById(req.session.userId).exec(function (error, user) {
    //     if (error) {
    //         return next(error);
    //     } else {      
    //         if (user === null) {     
    //             var err = new Error('Not authorized! Go back!');
    //             err.status = 400;
    //             return next(err);
    //         } else {
    //             return next();
    //         }
    //     }
    // });



}

