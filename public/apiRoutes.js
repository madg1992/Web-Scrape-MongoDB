// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("../models");

module.exports = app => {
    // A GET route for scraping the echoJS website
    app.get("/scrape", function (req, res) {
        // First, we grab the body of the html with axios
        axios.get("https://www.npr.org/sections/news/").then(function (response) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(response.data);

            // Now, we grab every h2 within an article tag, and do the following:
            $("article.item").each(function (i, element) {
                // Save an empty result object
                var result = {};

                result.date = $(this)
                    .children('div.item-info-wrap')
                    .children('div.item-info')
                    .children('p.teaser')
                    .children('a')
                    .children('time')
                    .text()
                    .trim();

                result.headline = $(this)
                    .children('div.item-info-wrap')
                    .children('div.item-info')
                    .children('h2')
                    .text();

                result.summary = $(this)
                    .children('div.item-info-wrap')
                    .children('div.item-info')
                    .children('p.teaser')
                    .children('a')
                    .text();

                result.link = $(this)
                    .children('div.item-image')
                    .children('div.item-info-wrap')
                    .children('div.item-info')
                    .children('a')
                    .attr('href');

                // Create a new Article using the `result` object built from scraping
                db.Article.create(result)
                    .then(function (dbArticle) {
                        // View the added result in the console
                        console.log(dbArticle);
                    })
                    .catch(function (err) {
                        // If an error occurred, log it
                        console.log(err);
                    });
            });

            // Send a message to the client
            res.send("Scrape Complete");
        });
    });

    // Route for getting all Articles from the db
    app.get("/articles", function (req, res) {
        // Grab every document in the Articles collection
        db.Article.find({}).sort('_id')
            .then(function (dbArticle) {
                // If we were able to successfully find Articles, send them back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // route for retrieving all the saved articles
    app.get("/saved", function (req, res) {
        db.Article.find({
            saved: true
        })
            .then(function (dbArticle) {
                // if successful, then render with the handlebars saved page
                res.render("saved", {
                    articles: dbArticle
                })
            })
            .catch(function (err) {
                // If an error occurs, send the error back to the client
                res.json(err);
            })

    });

    // route for setting an article to saved
    app.put("/saved/:id", function (req, res) {
        db.Article.findByIdAndUpdate(
            req.params.id, {
            $set: req.body
        }, {
            new: true
        })
            .then(function (dbArticle) {
                res.render("saved", {
                    articles: dbArticle
                })
            })
            .catch(function (err) {
                res.json(err);
            });
    });

    // route for saving a new note to the db and associating it with an article
    app.post("/submit/:id", function (req, res) {
        db.Note.create(req.body)
            .then(function (dbNote) {
                var articleIdFromString = mongoose.Types.ObjectId(req.params.id)
                return db.Article.findByIdAndUpdate(articleIdFromString, {
                    $push: {
                        notes: dbNote._id
                    }
                })
            })
            .then(function (dbArticle) {
                res.json(dbNote);
            })
            .catch(function (err) {
                // If an error occurs, send it back to the client
                res.json(err);
            });
    });

    // route to find a note by ID
    app.get("/notes/article/:id", function (req, res) {
        db.Article.findOne({ "_id": req.params.id })
            .populate("notes")
            .exec(function (error, data) {
                if (error) {
                    console.log(error);
                } else {
                    res.json(data);
                }
            });
    });


    app.get("/notes/:id", function (req, res) {

        db.Note.findOneAndRemove({ _id: req.params.id }, function (error, data) {
            if (error) {
                console.log(error);
            } else {
            }
            res.json(data);
        });
    });









    // Route for grabbing a specific Article by id, populate it with it's note
    app.get("/articles/:id", function (req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        db.Article.findOne({ _id: req.params.id })
            // ..and populate all of the notes associated with it
            .populate("note")
            .then(function (dbArticle) {
                // If we were able to successfully find an Article with the given id, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for saving/updating an Article's associated Note
    app.post("/articles/:id", function (req, res) {
        // Create a new note and pass the req.body to the entry
        db.Note.create(req.body)
            .then(function (dbNote) {
                // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
                // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
                // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
            })
            .then(function (dbArticle) {
                // If we were able to successfully update an Article, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });
}