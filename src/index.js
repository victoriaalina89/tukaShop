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
const CarouselImage = require('../CarouselImage');
// const express = require('express');
// var mysql = require('mysql2');

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

const storageCarousel = multer.diskStorage({
    destination: './src/public/images/carousel',
    filename: function(request, file, callback) {
        const newCarouselImage = new CarouselImage(request.params.id, request.body.name);
        callback(null, newCarouselImage.getNameForImage() + path.extname(file.originalname))
    }
})

const uploadCarouselImage = multer({
    storage: storageCarousel,
    limits: {fileSize: 1000000},
    fileFilter: function(request,file, callback) {
        checkFileType(file, callback);
    }
})


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
app.get( '/', async (request, response) => {

    const mysql = require('mysql2/promise');

    const connection = await mysql.createConnection({
        host: "localhost",
        user: "usuario",
        password: "password",
        database: "db"
    });

    const [rows, fields] = await connection.query("SELECT * FROM products");

    const productsIntoClasses = rows.map(product => {

        const newProduct = new Product(product.id, product.name, product.description, product.image);

        if(product.deleted) {
            newProduct.markAsDeleted();
        }

        return newProduct;
    })

    const [rowsCarousel, fieldsCarousel] = await connection.query("SELECT * FROM carousel");

    const carouselImagesIntoClasses = rowsCarousel.map(carouselImage => {

        const newCarouselImage = new CarouselImage(carouselImage.id, carouselImage.name, carouselImage.image);

        if(carouselImage.deleted) {
            newCarouselImage.markAsDeleted();
        }

        return newCarouselImage;
    })
    
    response.render('index.ejs', {products: productsIntoClasses, carouselImages: carouselImagesIntoClasses});
    
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

app.get('/admin/products-list', [urlencoudedParser, adminSession.isAdmin],  async (request, response) => {

    const mysql = require('mysql2/promise');

    const connection = await mysql.createConnection({
        host: "localhost",
        user: "usuario",
        password: "password",
        database: "db"
    });

    const [rows, fields] = await connection.query("SELECT * FROM products");

    const productsIntoClasses = rows.map(product => {
        const newProduct = new Product(product.id, product.name, product.description, product.image);

        if(product.deleted) {
            newProduct.markAsDeleted();
        }

        return newProduct
    })

    response.render('productsList.ejs', {products: productsIntoClasses});
    
});

app.get('/admin/add-product', [urlencoudedParser, adminSession.isAdmin], (request, response) => {
   response.render('addProduct.ejs') 
})

app.post('/admin/add-product', [urlencoudedParser, adminSession.isAdmin, upload.single('image')] , async (request, response) => {

    const mysql = require('mysql2/promise');

    const connection = await mysql.createConnection({
        host: "localhost",
        user: "usuario",
        password: "password",
        database: "db"
    });

    const images = "/images/" + request.file.filename;

    await connection.query('INSERT INTO products (deleted, name, description, image) VALUES(false, ?, ?, ? )',
     [request.body.name, request.body.description, images]);

    response.redirect('/admin/products-list');

});

app.get('/admin/delete-product/:id', [urlencoudedParser, adminSession.isAdmin], async (request, response) => {

    request.params.id;

    const mysql = require('mysql2/promise');

    const connection = await mysql.createConnection({
        host: "localhost",
        user: "usuario",
        password: "password",
        database: "db"
    });

    await connection.query("UPDATE products SET deleted = true WHERE id = ? ", [request.params.id]);
    

    response.redirect('/admin/products-list');
    
});

app.get('/admin/modify-product/:id', [urlencoudedParser, adminSession.isAdmin], async (request, response) => {
    
    request.params.id;
    

    var mysql = require('mysql2/promise');

    var connection = await mysql.createConnection({
        host: "localhost",
        user: "usuario",
        password: "password",
        database: "db"
    });

    const [rows, fields] = await connection.query("SELECT * FROM products WHERE id= ?", [request.params.id]);

    const newProduct = new Product(request.params.id, rows[0].name, rows[0].description, rows[0].image);

    response.render('modifyProduct.ejs', { productName: newProduct.getName(), productId: request.params.id, 
        productDescription: newProduct.getDescription(), imagePath: newProduct.getImage()});


});

app.post('/admin/modify-product/:id', [urlencoudedParser, adminSession.isAdmin, upload.single('image')], async (request,response) => {

    request.params.id; 

    const mysql = require('mysql2/promise');

    const connection = await mysql.createConnection({
        host: "localhost",
        user: "usuario",
        password: "password",
        database: "db"
    });

    const [rows, fields] = await connection.query("SELECT * FROM products WHERE id= ?", [request.params.id]);

    const newProduct = new Product(request.params.id, request.body.name, request.body.description, rows[0].image);

    if(request.file === undefined && newProduct.getName() !== rows[0].name) {
            
        const index = newProduct.getImage().lastIndexOf(".");
        const result = newProduct.getImage().substr(index+1);

        fs.rename('./src/public' + newProduct.getImage(), './src/public/images/' + newProduct.getNameForImage() + '.' + result, function(error) {
            if ( error ) console.log('ERROR: ' + error);
        });

        const images = "/images/" + newProduct.getNameForImage() + "." + result;

        await connection.query('UPDATE products SET name = ?, description = ?, image = ? WHERE id = ?',
         [newProduct.getName(), newProduct.getDescription(), images, request.params.id]);

       
        response.redirect('/admin/products-list');

        return
    }

    if(request.file === undefined && newProduct.getDescription() !== rows[0].description) {

        await connection.query('UPDATE products SET description = ? WHERE id = ?', 
        [newProduct.getDescription(), request.params.id])


        response.redirect('/admin/products-list');

        return
    }

    if(request.file === undefined && newProduct.getName() === rows[0].name && newProduct.getDescription() === rows[0].description) {
    
        response.redirect('/admin/products-list');

        return
    }


    const index = request.file.filename.lastIndexOf(".");
    const result = request.file.filename.substr(index+1);

    const imageExt = newProduct.getImage().lastIndexOf(".");
    const extension = newProduct.getImage().substr(imageExt+1);

        
    if(extension !== result) {

        fs.unlink('./src/public' + newProduct.getImage(), (err) => {

            if (err) {
                console.error(err)

                return
            }
    
        })
    }

    const image = "/images/" + newProduct.getNameForImage() + '.' + result;

    await connection.query('UPDATE products SET name = ?, description = ?, image = ? WHERE id = ?', 
    [newProduct.getName(), newProduct.getDescription(), image, request.params.id]);

    
    response.redirect('/admin/products-list');

});

app.get('/admin/carousel-images-list', adminSession.isAdmin, async (request,response) => {

    const mysql = require('mysql2/promise');

    const connection = await mysql.createConnection({
        host: "localhost",
        user: "usuario",
        password: "password",
        database: "db"
    });

    const [rows, fields] = await connection.query("SELECT * FROM carousel");

    const carouselImagesIntoClasses = rows.map(carouselImage => {
        const newCarouselImage = new CarouselImage(carouselImage.id, carouselImage.name, carouselImage.image);

        if(carouselImage.deleted) {
            newCarouselImage.markAsDeleted();
        }

        return newCarouselImage;
    })

    // connection.query("SELECT * FROM carousel", function (error, carouselImages, fields) {
    //     if (error) throw error;
    //     const carouselImagesIntoClasses = carouselImages.map(function(carouselImage) {
    //         const newCarouselImage =  new CarouselImage(carouselImage.id, carouselImage.name, carouselImage.image);

    //         if(carouselImage.deleted) {
    //             newCarouselImage.markAsDeleted();
    //         }

    //         return newCarouselImage;
    //     })

    response.render('carouselImagesList.ejs', {carouselImages: carouselImagesIntoClasses});
    // });
})

app.get('/admin/add-image-carousel', adminSession.isAdmin, (request, response) => {

    response.render('addImageCarousel.ejs');
})

app.post('/admin/add-image-carousel', [urlencoudedParser, uploadCarouselImage.single('image')], async (request, response) => {

    const mysql = require('mysql2/promise');

    const connection = await mysql.createConnection({
        host: "localhost",
        user: "usuario",
        password: "password",
        database: "db"
    });

    const imagePath = '/images/carousel/' + request.file.filename;

    await connection.query('INSERT INTO carousel (deleted, name, image) VALUES(false, ?, ?)', [request.body.name, imagePath]);

    response.redirect('/admin/carousel-images-list');
})

app.get('/admin/delete-carousel-image/:id', [adminSession.isAdmin, urlencoudedParser], async (request, response) => {

    request.params.id;

    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
        host: "localhost",
        user: "usuario",
        password: "password",
        database: "db"
    });

    await connection.query("UPDATE carousel SET deleted = true WHERE id = ?", [request.params.id]);

    response.redirect('/admin/carousel-images-list');

})


//listening the server
app.listen(app.get('port'), () => {
    console.log('server on port', app.get('port'));
})