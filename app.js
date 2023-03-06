if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}// this code will always run in develpment mode

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const mongoSanitize = require('express-mongo-sanitize'); // this package help prevent any symbols like"$%.." in the query string, for security reason
const helmet = require('helmet');//for security
// const dbUrl = process.env.DB_URL;  
const dbUrl = 'mongodb://127.0.0.1:27017/yelp-camp';
const { join } = require('path');
const app = express();
const MongoStore = require('connect-mongo');// use Mongo for our session stor/ store session in our mongo database/ create a collection called session

mongoose.set('strictQuery', true);
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(dbUrl);
    console.log("DATABASE CONNECTED")
}

// async function main() {
//     await mongoose.connect(dbUrl);
//     console.log("DATABASE CONNECTED")
// } //connect to mongodb atlas database when deploying

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // to parse req.body
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecretgit'
    }
});

store.on('error', function (e) {
    console.log('SESSION STORE ERROR', e)
})

const sessionConfig = {
    store, // it's the short way to say store: store, 
    name: "session", // the default name for this is connect.sid, for security reasons, we don't want to people to look for the name, we give it a 'fake' name. 
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());  // this two app.use is for the use of passport, session() must be before passport.session()
passport.use(new LocalStrategy(User.authenticate()));
// ask passport to use the LocalStrategy that we have downloaded and requried, and for that local strategy, the authentication method is going to be located on the User model, which is called authenticate()
passport.serializeUser(User.serializeUser());//how to we store a user in the session
passport.deserializeUser(User.deserializeUser());//how to get a user out of that session

app.use(flash());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);



// all for helmet set up 
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dewkyhwvl"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dewkyhwvl"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dewkyhwvl"
];
const fontSrcUrls = ["https://res.cloudinary.com/dewkyhwvl"];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dewkyhwvl", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc: ["https://res.cloudinary.com/dewkyhwvl"],
            childSrc: ["blob:"]
        }
    })
);

app.get('/', (req, res) => {
    res.render('home')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found!!!!!!!', 404));
})
// it means apply to all request like put, get, post...
// * means all url that does not match what has stated above
// we could just throw an error here, but we dont' know if any error will be async, so to be safe, we use next()

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = "OH NO SOMETHING WENT WRONG";
    }
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('SERVING ON PORT 3000')
})
