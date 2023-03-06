const Campground = require('../models/campground');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'); // for mapbox geocoding
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const { cloudinary } = require('../cloudinary');//for storing pictures in cloudinary

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })

}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry; //mapbox gives us a Geojson format we can use directly in here
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename })); // Thanks to multer, now we can access req.files ( an array), we need to take the path and filename value to add to our campground model.
    campground.author = req.user._id; //add author information to the campground. 'req.user' has all the user info because of passport
    await campground.save();
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author'); // it means first populate review and review.author, and then populate author of the campground
    if (!campground) {
        req.flash('error', 'Campground not found!!!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found!!!');
        return res.redirect('/campgrounds');
    }
    // if (!campground.author.equals(req.user._id)) {  // move this logic to middleware 
    //     req.flash('error', 'You do not have permission to do that, please log in.')
    //     return res.redirect(`/campgrounds/${campground._id}`);
    // }
    res.render('campgrounds/edit', { campground })

}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    // const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { runValidators: true });
    // the above line of code is not working at more, because we want to protect the update and delete routes so that only the currentUser who owns it can do it
    // so we need to first find and then compare if it is the author and then update. see following...
    // const campground = await Campground.findById(id);
    // if (!campground.author.equals(req.user._id)) {
    //     req.flash('error', 'You do not have permission to do that, please log in.')
    //     return res.redirect(`/campgrounds/${campground._id}`);
    // }
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { runValidators: true });
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...images); // push is to add new images, ... is for not passing the array, just the data in the array.
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        };
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    };
    req.flash('success', `Successfully updated the campground ${campground.title}!`);
    res.redirect(`/campgrounds/${campground._id}`)
}


module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    await Campground.findByIdAndDelete(id);
    req.flash('success', `Successfully deleted the campground ${campground.title}!`)
    res.redirect('/campgrounds');
}

