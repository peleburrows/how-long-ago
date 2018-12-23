const axios = require('axios');

//date formatting, millisecond conversion
const dates = require('./dates');
//get details about cast and crew
const people = require('./people');


// const search_path = 'https://api.themoviedb.org/3/search/movie';
// const api_key = 'f8c246237ba20222ad158986811e574f';
// const img_cfg_path = 'https://api.themoviedb.org/3/configuration';

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
var getMovie = (str_search, callback) => {

    //the struct that will eventually be returned from calling this method
    var skv_return = {
        success: false,
        msg: 'fail',
        data: {}
    };

    var str_encoded_search = str_search;

    //path to call the API to get configuration available for images
    var movie_db_img_cfg_url = `${api_cfg.paths.config}?api_key=${api_cfg.key}`;
    
    //path to call the API to get movie detail
    var movie_db_url = `${api_cfg.paths.search}/movie?api_key=${api_cfg.key}&query=${str_encoded_search}`;

    //in order to get images we need to get call the movie db api to get configuration values
    //e.g sizes available, paths to use etc
    axios.get(movie_db_img_cfg_url)
        .then( (response) => {

            //store the reponse so we have access to it elsewhere in the module
            skv_img_cfg = response.data;

            //do another call to actually get movie details
            return axios.get(movie_db_url);
           
        })
        //handle response from getting movie details
        .then( (response) => {
            
            var res_film = response.data.results[0];

            //struct of values that will be returned
            skv_return.data = {
                id  : res_film.id,
                title   : res_film.title,
                img_path: {
                    backdrop    : `${skv_img_cfg.images.secure_base_url}${skv_img_cfg.images.backdrop_sizes[2]}${res_film.backdrop_path}`,
                    poster      : `${skv_img_cfg.images.secure_base_url}${skv_img_cfg.images.poster_sizes[5]}${res_film.poster_path}`
                },
                date: {
                    release : res_film.release_date,
                    get release_output () {
                        //call the getter to format the date in to human readable text
                        return dates.getFormattedDateOutput(this.release);
                    },
                    get how_many_ms_ago () {
                        return dates.getHowManyMSago(this.release);
                    },
                    get how_long_ago_output () {
                        return dates.getFormattedMSoutput(this.how_many_ms_ago);
                    }
                }
            };

            return people.getPeople({
                                film_id : res_film.id,
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
    getMovie
};