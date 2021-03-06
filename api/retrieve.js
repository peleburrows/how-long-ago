const axios = require('axios');

const movies = require('./movies.js');

// get details about cast and crew
const people = require('./people');

const movie_db_base_path = 'https://api.themoviedb.org/3';

const api_cfg = {
  paths: {
    base: movie_db_base_path,
  },
  key: 'f8c246237ba20222ad158986811e574f',
};

/**
 * Search movie db with search title
 * @param str_search Not encoded search input from the user
 */
const getPossibleMovies = (cfg, callback) => {
  // the struct that will eventually be returned from calling this method
  const skv_return = {
    success: false,
    msg: 'fail',
    data: {},
  };

  // path to call the API to get configuration available for images
  const movie_db_img_cfg_url = `${api_cfg.paths.base}/configuration?api_key=${api_cfg.key}`;
  // in order to get images we need to get call the movie db api to get configuration values
  // e.g sizes available, paths to use etc
  axios.get(movie_db_img_cfg_url)
    .then((response) => {
      // TODO: appropriate error handling for skv img
      const skv_movie_cfg = {
        search_terms: cfg.search_terms,
        region_code: cfg.region_code,
        skv_img_cfg: response.data,
        api_cfg,
      };

      // do another call to actually get movie details
      return movies.getMovies(skv_movie_cfg);
    })
    // deal with response from getting cast
    .then((response) => {
      if (response.success) {
        skv_return.success = true;
        skv_return.msg = 'success';
        skv_return.data = response.data;
      } else {
        throw response.err_object;
      }

      callback(skv_return);
    })
    .catch((e) => {
      let err_msg = '';
      if (e.message) {
        err_msg = e.message;
      } else {
        err_msg = 'Not able to connect to api servers';
      }
      callback({
        success: false,
        msg: err_msg,
        stacktrace: e.stack,
        data: {},
      });
    });
};

/**
 * Search movie db with search title
 * @param str_search Not encoded search input from the user
 */
const getFullMovieDetails = (cfg, callback) => {
  // the struct that will eventually be returned from calling this method
  const skv_return = {
    success: false,
    msg: 'fail',
    data: {},
  };

  // path to call the API to get configuration available for images
  const movie_db_img_cfg_url = `${api_cfg.paths.base}/configuration?api_key=${api_cfg.key}`;
  // in order to get images we need to get call the movie db api to get configuration values
  // e.g sizes available, paths to use etc
  axios.get(movie_db_img_cfg_url)
    .then((result) => {
      // TODO: replace search terms with movie id
      const skv_movie_cfg = {
        id: cfg.id,
        region_code: cfg.region_code,
        skv_img_cfg: result.data,
        api_cfg,
      };

      // do another call to actually get movie details
      movies.getFullMovieById(skv_movie_cfg)
        // handle response from getting movie details
        .then((response) => {
          skv_return.data = response.data;

          if (!response.success) {
            throw response.err_object;
          }

          return people.getPeople({
            film_id: skv_return.data.id,
            release_dates: skv_return.data.selected_region.release_dates,
            api_cfg,
          });
        })
        // deal with response from getting cast
        .then((response) => {
          if (response.success) {
            skv_return.success = true;
            skv_return.msg = 'success';
            skv_return.data.people = response.data;
          }

          callback(skv_return);
        })
        .catch((e) => {
          let err_msg = '';
          if (e.message) {
            err_msg = e.message;
          } else {
            err_msg = 'Not able to connect to api servers';
          }
          callback({
            success: false,
            msg: err_msg,
            stacktrace: e.stack,
            data: {},
          });
        });
    });
};

// expose the function to be used by whatever is importing this module
module.exports = {
  getFullMovieDetails,
  getPossibleMovies,
};
