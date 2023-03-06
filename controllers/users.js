const User = require('../models/user');

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register')
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

module.exports.renderLogInForm = (req, res) => {
    res.render('users/login')
}

module.exports.logIn = (req, res) => {
    req.flash('success', `Welcome Back!${req.user.username}`);
    const redirectUrl = req.session.returnTo || '/campgrounds'; // redirect the user to the url that they required, not just campgrounds. 
    //if Javascript evaluates what is on the left operand to be true, it does not need to go ahead and evaluate what is on the right operand. So it simply returns the value of the left operand. 
    //However, if the left operand evaluates to be false, what Javascript would do is it would return whatever is on the right operand.
    delete req.session.returnTo; // delete the url in the session, just because don't need it in the session anymore
    res.redirect(redirectUrl); // when 307 is not added, when I am not logged in, if i press the delete review button, it direct me to "page not found" instead of the show page
    // it is because when we redirect, we redirect a get method, not a delete method. so we need to keep the method, we add 307, see the solution in stackoverflow.  
    // https://stackoverflow.com/questions/72336177/error-reqlogout-requires-a-callback-function
}

module.exports.logOut = (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err) };
        req.flash('success', 'You have logged out!');
        res.redirect('/campgrounds');
    });
}