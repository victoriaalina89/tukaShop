class CarouselImage {
    constructor(id, name, image) {
        this.id = id,
        this.deleted = false,
        this.name = name,
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


    getImage() {
        return this.image;
    }

    getNameForImage() {
        const lowerCaseName = this.name.toLowerCase();
        return lowerCaseName.split(" ").join("-");
    }

}

module.exports = CarouselImage;