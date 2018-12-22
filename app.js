const express = require('express');
//handlebars templating engine
const hbs = require('hbs');

const movies = require('./api/movies');

//process has all our environment variables set as key value pairs
//heroku will set process.env.PORT otherwise we'll just use 3000 like localhost:3000 
const port = process.env.PORT || 3000;

var app = express();

//for rendering parts of a site
hbs.registerPartials(__dirname + '/views/partials');

//tell express to use handlebars as the view engine
app.set('view engine', 'hbs');

app.get('/', (req, res) => {

    movies.getMovie('fight club', (skv_movie) => {

        // TODO: error handling
        //use a handlebars template page and pass in 
        //a struct of data
        res.render('home.hbs', skv_movie.data);

    });


});



//which port are we going to listen to requests from
//do something once the server is up
app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});