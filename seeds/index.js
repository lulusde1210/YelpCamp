const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
mongoose.set('strictQuery', true);

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
    console.log("DATABASE CONNECTED")
}


const sample = function (array) {
    return array[Math.floor(Math.random() * array.length)];
}


const seedDB = async function () {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author: '63f59898410629c62b3234d8', // all the campgrounds have a author 
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(places)} ${sample(descriptors)} `,
            price: price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dewkyhwvl/image/upload/v1677685484/YelpCamp/yqgxz3a51k0tuosfsrz5.avif',
                    filename: 'YelpCamp/yqgxz3a51k0tuosfsrz5',
                },
                {
                    url: 'https://res.cloudinary.com/dewkyhwvl/image/upload/v1677685484/YelpCamp/aoszrtinx0gfb0wrnv6y.avif',
                    filename: 'YelpCamp/aoszrtinx0gfb0wrnv6y',
                },
                {
                    url: 'https://res.cloudinary.com/dewkyhwvl/image/upload/v1677685484/YelpCamp/cexwrld9g7vgslorgwhe.avif',
                    filename: 'YelpCamp/cexwrld9g7vgslorgwhe',
                }
            ],
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. At corporis suscipit veritatis error rerum, possimus, minus esse iure nihil assumenda ipsa nulla excepturi. Beatae quos debitis nulla distinctio, labore quis?"

        })
        await camp.save();
    }

}

seedDB().then(() => {
    mongoose.connection.close();
})