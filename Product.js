const { request } = require("express");

class Product {
    constructor(id, name, description) {
        this.id = id,
        this.deleted = false,
        this.name = name,
        this.description = description,
        this.image = image
    }

    markAsDeleted() {
        this.deleted = true;
    }

    markAsNotDeleted() {
        this.deleted = false;
    }

    getName() {
        return this.name;
    }

    getDescription() {
        return this.description;
    }

    getImage() {
        return this.image;
    }

    // getImagePath() {
    //     const imagePath = '/image/' + this.image;
    //     return imagePath;
    // }

    getNameForImage() {
        const lowerCaseName = this.name.toLowerCase();
        return lowerCaseName.split(" ").join("-");
    }
}

module.exports = Product;

