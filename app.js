const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require('passport');
const config = require('./config/database');
const Article = require('./models/article'); // Import Article model

// Connect to MongoDB
mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;

// Check connection
db.once('open', () => {
    console.log("Connected to MongoDB");
});

// Check for DB errors
db.on('error', (error) => {
    console.error("MongoDB connection error:", error);
});



// Initialize Express
const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set view engine to EJS
app.set("view engine", "pug");

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// Express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Express validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Passport config
require('./config/passport')(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Global user variable
app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Home route
app.get('/', (req, res) => {
    Article.find({}, (err, articles) => {
        if (err) {
            console.error("Error fetching articles:", err);
            res.status(500).send("Internal Server Error");
        } else {
            res.render("index", {
                articles: articles
            });
        }
    });
});

// Article routes
app.use('/articles', require('./routes/articles'));

// User routes
app.use('/users', require('./routes/users'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
