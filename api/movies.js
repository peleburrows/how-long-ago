const axios = require('axios');

//date formatting, millisecond conversion
const dates = require('./dates');

/**
 * Search movie db with search title
 * @param str_search Not encoded search input from the user 
 */
var getMovie = (skv_cfg) => {

    //the struct that will eventually be returned from calling this method
    var skv_return = {
        success: false,
        msg: 'fail',
        data: {}
    };

    var api_cfg = skv_cfg.api_cfg;
    var skv_img_cfg = skv_cfg.skv_img_cfg;

    var str_encoded_search = skv_cfg.search;

    //path to call the API to get movie detail
    var movie_db_url = `${api_cfg.paths.search}/movie?api_key=${api_cfg.key}&query=${str_encoded_search}`;

    //get the movie details
    return axios.get(movie_db_url)
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
                    get how_long_ago () {
                        //get the current date and the date of the release
                        //find the difference in ms
                        return dates.getDifferenceMSBetween2Dates(new Date(), new Date(this.release));
                    }
                }
            
            };

            skv_return.success = true;
            skv_return.msg = 'success';

            return skv_return;

        })
        .catch( (e) => {
            
            var err_msg = '';

            if(e.message) {
                err_msg = e.message;
            } else {
                err_msg = 'Not able to connect to api servers';
            }

            return{
                success: false,
                msg: err_msg,
                stacktrace: e.stack,
                data: {}
            };
    
        });

};




//expose the function to be used by whatever is importing this module 
module.exports = {
    getMovie
};