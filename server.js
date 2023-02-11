if (process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}

//Importing libraries that we installed using npm
const express = require("express")
const app = express()
const bcrypt = require("bcrypt") //importing bcrypt package
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const rateLimit = require("express-rate-limit");
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const methodOverride = require("method-override")
const mongoose = require("mongoose")
const MongoStore = require('connect-mongo');
const User = require('./models/user')
const URI = process.env.MONGODB_URI;

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 60 minutes
    max: 3
});

mongoose.set('strictQuery', false)

mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(db => console.log('DB is connected'))
  .catch(err => console.error(err));

initializePassport(
  passport,
  email => User.findOne(user => user.email === email),
  id => User.findById(id)
)

//this is the middleware
app.set("view-engine", "ejs");
app.use(express.urlencoded({
    extended: false
}))
app.use(flash())
// Advanced usage
app.use(session({
    secret: "secret",
    crypto: {
        secret: "secret"
    },
    resave: false,
    saveUninitialized: false,
    autoRemove: 'native', // Default
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      touchAfter: 24 * 3600
    })
  }));
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/public'));
//app.prepare().then(() => {
//    server.use(helmet())
//})
app.use(cookieParser());
//app.use(csrf({ cookie: true }));
//app.use(morgan('dev'));
//require('./routes/currency.route.js')(app);

//routes
app.get("/", (_req, res) => {
    res.render("index.ejs")
//        name: req.user.name
})

app.get("/login", checkNotAuthenticated, (_req, res) => {
    res.render("login.ejs")
})

app.post("/login", registerLimiter, checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))

app.get("/register", checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

app.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
        //Hashing the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        // Create a new user
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        //save the user
        user.save()
        res.redirect("/login")
    } catch {
        res.redirect("/register")
    }
})
app.delete("/logout", (req, res) => {
    req.logOut()
    res.redirect("/login")
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/")
    }
    next()
}

app.listen(3000)