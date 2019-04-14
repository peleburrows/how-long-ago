const express = require('express');
// handlebars templating engine
const hbs = require('hbs');
// to handle joining/concatenating paths
const path = require('path');
// module for getting all the data
const retrieve = require('./api/retrieve');

// process has all our environment variables set as key value pairs
// heroku will set process.env.PORT otherwise we'll just use 3000 like localhost:3000
const port = process.env.PORT || 3000;

const app = express();

const public_directory_path = path.join(__dirname, '/public');

// from es lint: "you can’t be sure what type of system the script is running on.
// Node.js can be run on any computer, including Windows, which uses a different
// path separator. It’s very easy, therefore, to create an invalid path using
// string concatenation and assuming Unix-style separators. There’s also the
// possibility of having double separators, or otherwise ending up with an invalid path."
const full_partials_path = path.join(__dirname, '/views/partials');
// for rendering parts of a site
hbs.registerPartials(full_partials_path);

// Setup static directory to serve
app.use(express.static(public_directory_path));

// tell express to use handlebars as the view engine
app.set('view engine', 'hbs');

app.get('', (req, res) => {
  // use a handlebars template page and pass in
  // a struct of data
  res.render('index.hbs');
});


app.get('/refine-search', (req, res) => {
  // default values to be used
  const cfg = {
    search_terms: 'fight club',
    region_code: 'US', // IT
  };

  // TODO: sort the linting here
  /* eslint-disable */
  // loop through the cfg struct of default values
  for(key in cfg) {
    // ensure we are only looking at key values from cfg struct
    // Note that checking .hasOwnProperty(key) may cause an error in some cases:
    // https://eslint.org/docs/rules/no-prototype-builtins
    if (Object.prototype.hasOwnProperty.call(req.query, key)) {
      cfg[key] = req.query[key];
    }
  }
  /* eslint-enable */

  // a url param needs to be passed in
  if (!cfg.search_terms.length) {
    res.send({
      error: 'You must provide a search term',
    });
    return;
  }


  // TODO: PASS IN FROM URL / USER INPUT / CMD LINE
  retrieve.getPossibleMovies(cfg, (rst_movies) => {
    // for just getting back data and then return to
    // stop the rest of the code running
    // res.send(rst_movies);
    // return;
    // TODO: error handling
    if (!rst_movies.success) {
    //   // use a handlebars template page and pass in
    //   // a struct of data
      res.render('error.hbs', rst_movies);
    } else {
    //   // use a handlebars template page and pass in
    //   // a struct of data
      res.render('refine-search.hbs', rst_movies.data);
    }
  });
});

app.get('/movie', (req, res) => {

  // default values to be used
  const cfg = {
    id: 0,
    region_code: 'US', // IT
  };

  // TODO: sort the linting here
  /* eslint-disable */
  // loop through the cfg struct of default values
  for(key in cfg) {
    // ensure we are only looking at key values from cfg struct
    // Note that checking .hasOwnProperty(key) may cause an error in some cases:
    // https://eslint.org/docs/rules/no-prototype-builtins
    if (Object.prototype.hasOwnProperty.call(req.query, key)) {
      cfg[key] = req.query[key];
    }
  }
  /* eslint-enable */

  // TODO: PASS IN FROM URL / USER INPUT / CMD LINE
  retrieve.getFullMovieDetails(cfg, (skv_movie) => {
    // for just getting back data and then return to
    // stop the rest of the code running
    // res.send(skv_movie);
    // return;
    // TODO: error handling
    if (!skv_movie.success) {
      // use a handlebars template page and pass in
      // a struct of data
      res.render('error.hbs', skv_movie);
    } else {
      // use a handlebars template page and pass in
      // a struct of data
      res.render('movie.hbs', skv_movie.data);
    }
  });
});

// which port are we going to listen to requests from
// do something once the server is up
app.listen(port, () => {
  console.log(`Server is up on port ${port}`); // eslint-disable-line
});
