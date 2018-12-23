const axios = require('axios');

const movies = require('./movies.js');

//get details about cast and crew
const people = require('./people');

const movie_db_base_path = 'https://api.themoviedb.org/3';

const api_cfg = {
    paths : {
        base    : movie_db_base_path,
        search  : `${movie_db_base_path}/search`,
        config  : `${movie_db_base_path}/configuration`
    },
    key : 'f8c246237ba20222ad158986811e574f'
};

var skv_img_cfg = {};



/**
 * Search movie db with search title
 * @param str_search Not encoded search input from the user 
 */
var getAll = (str_search, callback) => {

    //the struct that will eventually be returned from calling this method
    var skv_return = {
        success: false,
        msg: 'fail',
        data: {}
    };


    //path to call the API to get configuration available for images
    var movie_db_img_cfg_url = `${api_cfg.paths.config}?api_key=${api_cfg.key}`;

    //in order to get images we need to get call the movie db api to get configuration values
    //e.g sizes available, paths to use etc
    axios.get(movie_db_img_cfg_url)
        .then( (response) => {

            //store the reponse so we have access to it elsewhere in the module
            skv_img_cfg = response.data;

            var skv_movie_cfg = {
                search : str_search,
                skv_img_cfg,
                api_cfg
            };

            //do another call to actually get movie details
            return movies.getMovie(skv_movie_cfg);
           
        })
        //handle response from getting movie details
        .then( (response) => {

            skv_return.data = response.data;
            return people.getPeople({
                                film_id : skv_return.data.id,
                                ms_since_release: skv_return.data.how_many_ms_ago,
                                api_cfg : api_cfg
                            });

        })
        //deal with response from getting cast
        .then ( ( response ) => {

            if(response.success) {
                skv_return.success = true;
                skv_return.msg = 'success';
                skv_return.data.people = response.data;
            } 

            callback(skv_return);

        })
        .catch( (e) => {
            
            var err_msg = '';

            if(e.message) {
                err_msg = e.message;
            } else {
                err_msg = 'Not able to connect to api servers';
            }

            callback({
                success: false,
                msg: err_msg,
                stacktrace: e.stack,
                data: {}
            });
    
        });

};




//expose the function to be used by whatever is importing this module 
module.exports = {
    getAll
};