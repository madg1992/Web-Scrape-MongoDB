// Require Dependencies
var express = require("express");
var mongoose = require("mongoose");
var exphs = require("express-handlebars");
var logger = require('morgan');


// Set the PORT
var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Define Middleware
// Use morgan logger for logging requests
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Initialize Handlebars
// Boilerplate code from npmjs.com
app.engine('handlebars', exphs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Serve the public directory
app.use(express.static("public"));

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// require routes
require()

app.listen(PORT, function () {
    console.log("App listening on http://localhost:" + PORT);
});