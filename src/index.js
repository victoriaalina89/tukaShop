const express = require ('express');
const app = express();
const serveStatic = require ('serve-static');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
// const { request } = require('express');
const auth = require('./auth');
const adminSession = require('./session');

const Product = require('../Product');

const urlencoudedParser = bodyParser.urlencoded({extended: false});

const storage = multer.diskStorage({
    destination: './src/public/images',
    filename: function(request, file, callback) {
        const newProduct = new Product(request.params.id, request.body.name, request.body.description);
        callback(null, newProduct.getNameForImage() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage,
    limits: {fileSize: 1000000},
    fileFilter: function(request,file, callback) {
        checkFileType(file, callback);
    }
}).single('image');

function checkFileType(file, cback) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if(extname && mimetype) {
        return cback(null, true);
    } else {
        cback('Error: imagenes only!');
    }
}

//setings
app.set('port', 4000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.engine('html', require('ejs').renderFile);

//static files
app.use(serveStatic(__dirname + '/public'));

app.use(session({
    resave: true, 
    saveUninitialized: true,
    secret: 'secret'
}));



//routes
app.get( '/', (request, response) => {
    response.render('index.ejs');
});

app.get('/admin/login', (request, response) => {
    response.render('login.ejs');
})

app.post('/admin/login', [urlencoudedParser, auth.isAuthorized] , (request,response) => {
    response.redirect('/admin/products-list');
    
})

app.get('/admin/invalid-login', (request, response) => {
    response.render('invalidUser.ejs');
})

app.get('/admin/products-list', [urlencoudedParser, adminSession.isAdmin] ,  (request, response) => {

        response.render('productsList.ejs');
    
});

app.get('/admin/add-product', [urlencoudedParser, adminSession.isAdmin], (request, response) => {
   response.render('addProduct.ejs') 
})

app.post('/admin/add-product', [urlencoudedParser, adminSession.isAdmin] , (request, response) => {
    
    upload(request, response, (error) => {
        if(error) {
            response.render('addProduct.ejs', {
                msg: error
            });
        }else{
            console.log(request.file);
            console.log(request.file.filename);
            response.render('addProduct.ejs', {file: '/image/' + request.file.filename});
        };
        
    });

    const mysql = require('mysql');
    const connection = mysql.createConnection({
        host: "localhost",
        user: "usuario",
        password: "password",
        database: "db"
    });

    connection.connect(function(error) {
        if(error) throw error;
        console.log("connected");
    
        const newProduct = new Product(request.params.id, request.body.name, request.body.description);

        const sql = "INSERT INTO products (deleted, name, description, image) VALUES(false, '" + newProduct.getName() + "', '" + newProduct.getDescription() + "', '/image/" + request.file.filename + "');"
        connection.query(sql, function(error, result) {
            if(error) throw error;
            console.log("1 record inserted");
        });
    });
 

});


//listening the server
app.listen(app.get('port'), () => {
    console.log('server on port', app.get('port'));
})