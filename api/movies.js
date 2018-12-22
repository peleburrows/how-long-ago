const axios = require('axios');

const search_path = 'https://api.themoviedb.org/3/search/movie';
const api_key = 'f8c246237ba20222ad158986811e574f';
const img_cfg_path = 'https://api.themoviedb.org/3/configuration';

var skv_img_cfg = {};



// TODO: DATES TO BE SPLIT IN TO A DATES.JS FILE AND IMPORTED
/**
 * Convert a date in to a nicer human readable string
 * @param str_date in 'yyyy-dd-mmm' format 
 */
var getFormattedDateOutput = (str_date) => {
    
    // create a date object using the passed in date so we have access
    // to toLocateDateString below
    var objDate = new Date(str_date);
    
    // date formatting options
    var date_options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    
    // convert to nice and readable text
    return objDate.toLocaleDateString("en-US", date_options);

}; 

/**
 * Find the difference in days between now and the date passed in
 * @param str_date in 'yyyy-dd-mmm' format 
 * @return diff_days the number of days difference between 2 dates
 */
var getHowManyMSago = (str_date_to_check) => {
    
    // the milliseconds in a single day
    // hours*minutes*seconds*milliseconds
    // var one_day = 24*60*60*1000; 

    //get date of the date to check
    var objCheckDate = new Date(str_date_to_check);
    
    //current date
    var objNowDate = new Date();

    // 1. calculate the time difference the date and 1970/01/01
    // 2. find the difference in time
    // 3. convert from ms to days
    // 4. round up 
    // var diff_days = Math.round(Math.abs((objNowDate.getTime() - objCheckDate.getTime())/(one_day)));
    
    var diff_ms = Math.abs(objNowDate.getTime() - objCheckDate.getTime());
    
    return diff_ms;

};

/**
 * TODO: HANDLE LEAP YEARS   
 * Convert to human readable time
 * @param num_ms millisecond value 
 * @return text
 */
var getFormattedMSoutput = (num_ms) => {
    
    //one day in milliseconds
    var one_day = 24*60*60*1000; 

    //convert to days
    var total_num_days = Math.round(num_ms / one_day); 

    var y = 365;
    var y2 = 31;
    var remainder = total_num_days % y;
    var casio = remainder % y2;
    year = (total_num_days - remainder) / y;
    month = (remainder - casio) / y2;
    
    var result = `${year} years ${month} months ${casio} days ago`;

    return result;

};


/**
 * Search movie db with search title
 * @param str_search Not encoded search input from the user 
 */
var getMovie = (str_search, callback) => {

    var str_encoded_search = str_search;
    var movie_db_url = `${search_path}?api_key=${api_key}&query=${str_encoded_search}`;

    var movie_db_img_cfg_url = `${img_cfg_path}?api_key=f8c246237ba20222ad158986811e574f`;

    //in order to get images we need to get call the movie db api to get configuration values
    //e.g sizes available, paths to use etc
    axios.get(movie_db_img_cfg_url)
        .then( (response) => {

            //store the reponse so we have access to it elsewhere in the module
            skv_img_cfg = response.data;

            return axios.get(movie_db_url);
           
        })
        .then( (response) => {
            
            var res_film = response.data.results[0];

            var local_image_cfg = skv_img_cfg.images;
console.log(local_image_cfg);

            var skv_return = {
                success: true,
                msg: 'success',
                data: {
                    title   : res_film.title,
                    img_path: {
                        backdrop    : `${local_image_cfg.secure_base_url}${local_image_cfg.backdrop_sizes[2]}${res_film.backdrop_path}`,
                        poster      : `${local_image_cfg.secure_base_url}${local_image_cfg.poster_sizes[5]}${res_film.poster_path}`
                    },
                    date: {
                        release : res_film.release_date,
                        get release_output () {
                            //call the getter to format the date in to human readable text
                            return getFormattedDateOutput(this.release);
                        },
                        get how_many_ms_ago () {
                            return getHowManyMSago(this.release);
                        },
                        get how_long_ago_output () {
                            return getFormattedMSoutput(this.how_many_ms_ago);
                        }
                    }
                }
            };
console.log(skv_return);
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
                data: {}
            });
    
        });

};




//expose the function to be used by whatever is importing this module 
module.exports = {
    getMovie
};