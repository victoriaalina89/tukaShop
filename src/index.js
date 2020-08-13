const express = require ('express');
const app = express();
const serveStatic = require ('serve-static');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
var fs = require('fs');

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
})
// .single('image');

function checkFileType(file, callback) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if(extname && mimetype) {
        return callback(null, true);
    } else {
        callback('Error: imagenes only!');
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

    var mysql = require('mysql');

    var connection = mysql.createConnection({
    host: "localhost",
    user: "usuario",
    password: "password",
    database: "db"
    });

    connection.connect(function(error) {
        if (error) throw error;
        connection.query("SELECT * FROM products" , function (error, products, fields) {
            if (error) throw error;
            const productsIntoClasses = products.map(function(product) {

                const newProduct = new Product(product.id, product.name, product.description, product.image);

                if(product.deleted) {
                    newProduct.markAsDeleted();
                }

                return newProduct;
            })
            
    
            response.render('index.ejs', { products: productsIntoClasses });
             
        });
        
    });


    
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

app.get('/admin/products-list', [urlencoudedParser, adminSession.isAdmin],  (request, response) => {

    var mysql = require('mysql');

    var connection = mysql.createConnection({
    host: "localhost",
    user: "usuario",
    password: "password",
    database: "db"
    });

    connection.connect(function(error) {
        if (error) throw error;
        connection.query("SELECT * FROM products", function (error, products, fields) {
            if (error) throw error;
            const productsIntoClasses = products.map(function(product) {
                const newProduct =  new Product(product.id, product.name, product.description, product.image);

                if(product.deleted) {
                    newProduct.markAsDeleted();
                }

                return newProduct;
            })

            response.render('productsList.ejs', {user: request.session.user, products: productsIntoClasses});
        });
    });
    
});

app.get('/admin/add-product', [urlencoudedParser, adminSession.isAdmin], (request, response) => {
   response.render('addProduct.ejs') 
})

app.post('/admin/add-product', [urlencoudedParser, adminSession.isAdmin, upload.single('image')] , (request, response) => {

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
    
        const newProduct = new Product(request.params.id, request.body.name, request.body.description, '/images/' + request.file.filename);

        const sql = 'INSERT INTO products (deleted, name, description, image) VALUES(false, "' + newProduct.getName() +
            '", "' + newProduct.getDescription() + '", "' + newProduct.getImage() + '");'
        connection.query(sql, function(error, result) {
            if(error) throw error;
            console.log("1 record inserted");
        });
    });

    response.redirect('/admin/products-list');

});

app.get('/admin/delete-product/:id', [urlencoudedParser, adminSession.isAdmin], (request, response) => {

    request.params.id;
    console.log(request.params.id);

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
       
        const sql = "UPDATE products SET deleted = true WHERE id ='" + request.params.id + "'";
        connection.query(sql, function(error, result) {
            if(error) throw error;
            console.log("1 record inserted");
        });
    });

    response.redirect('/admin/products-list');
    
});

app.get('/admin/modify-product/:id', [urlencoudedParser, adminSession.isAdmin], (request, response) => {
    
    request.params.id;
    

    var mysql = require('mysql');

    var connection = mysql.createConnection({
    host: "localhost",
    user: "usuario",
    password: "password",
    database: "db"
    });

    connection.connect(function(error) {
        if (error) throw error;
        connection.query("SELECT * FROM products WHERE id='" + request.params.id + "'" , function (error, products, fields) {
            if (error) throw error;

            
            const newProduct = new Product(request.params.id, products[0].name, products[0].description, products[0].image);
            response.render('modifyProduct.ejs', { productName: newProduct.getName(), productId: request.params.id, 
                productDescription: newProduct.getDescription(), imagePath: newProduct.getImage()});
             
        });
        
    });
});

app.post('/admin/modify-product/:id', [urlencoudedParser, adminSession.isAdmin, upload.single('image')], (request,response) => {

    request.params.id; 

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

        connection.query("SELECT * FROM products WHERE id='" + request.params.id + "'" , function (error, products, fields) {
            if (error) throw error;
            

        const newProduct = new Product(request.params.id, request.body.name, request.body.description, products[0].image);

        if(request.file === undefined && newProduct.getName() !== products[0].name) {
            
            console.log('hola');
            var index = newProduct.getImage().lastIndexOf(".");
            var result = newProduct.getImage().substr(index+1);

            fs.rename('./src/public' + newProduct.getImage(), './src/public/images/' + newProduct.getNameForImage() + '.' + result, function(error) {
                if ( error ) console.log('ERROR: ' + error);
            });

            const sql = 'UPDATE products SET name ="' + newProduct.getName() + '", description ="' + newProduct.getDescription() +
            '", image ="/images/' + newProduct.getNameForImage() + '.' + result + '" WHERE id ="' + request.params.id + '"';

            connection.query(sql, function(error, result) {
                if(error) throw error;
                console.log("1 record uploded");
            });
        }


        if(request.file !== undefined){

            console.log('chau');
            var index = request.file.filename.lastIndexOf(".");
            var result = request.file.filename.substr(index+1);

            fs.unlink('./src/public' + newProduct.getImage(), (err) => {
        
                if (err) {
                console.error(err)
                return
                }
            
            })

            const sql = 'UPDATE products SET name ="' + newProduct.getName() + '", description ="' + newProduct.getDescription() +
            '", image ="/images/' + newProduct.getNameForImage() + '.' + result + '" WHERE id ="' + request.params.id + '"';

            connection.query(sql, function(error, result) {
                if(error) throw error;
                console.log("1 record uploded");
            });
        }
       
    });

});
    
    response.redirect('/admin/products-list');

});


//listening the server
app.listen(app.get('port'), () => {
    console.log('server on port', app.get('port'));
})