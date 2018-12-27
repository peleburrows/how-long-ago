const express = require('express');
//handlebars templating engine
const hbs = require('hbs');

const retrieve = require('./api/retrieve');

//process has all our environment variables set as key value pairs
//heroku will set process.env.PORT otherwise we'll just use 3000 like localhost:3000 
const port = process.env.PORT || 3000;

var app = express();

//for rendering parts of a site
hbs.registerPartials(__dirname + '/views/partials');

//tell express to use handlebars as the view engine
app.set('view engine', 'hbs');

app.get('/', (req, res) => {

    var cfg = {
        search_terms: 'fight club',
        region_code: 'IT' //US
    };

    //TODO: PASS IN FROM URL / USER INPUT / CMD LINE
    retrieve.getAll(cfg, (skv_movie) => {

    // console.log(JSON.stringify(skv_movie, undefined, 2));

        res.send(skv_movie);

        // TODO: error handling
        if(!skv_movie.success) {
            //use a handlebars template page and pass in 
            //a struct of data
            // res.render('error.hbs', skv_movie);            
        } else {

            //use a handlebars template page and pass in 
            //a struct of data
            // res.render('home.hbs', skv_movie.data);
        }



    });


});



//which port are we going to listen to requests from
//do something once the server is up
app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});