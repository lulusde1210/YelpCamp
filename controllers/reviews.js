const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created a review!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Review deleted!');
    res.redirect(`/campgrounds/${campground._id}`);

}

module.exports.createUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = await new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => { // call this method so that after register, the user is automatically loggin in , they don't need to log in on more time after register
            if (err) { return next(err) }; // req.login() is a async function but does not support await, it needs a callback function. 
            req.flash('success', 'Welcome to yelp-camp!');
            res.redirect('/campgrounds');
        });

    } catch {
        req.flash('error', 'The username already exist, please try another one!');
        res.redirect('/register');
    }

}

