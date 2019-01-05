const axios = require('axios');

// date formatting, millisecond conversion
const dates = require('./dates');

// for getting inflation for selected country
const finance = require('./finance');


/**
 * Search movie db with search title
 * @param str_search Not encoded search input from the user 
 */
var getMovie = (skv_cfg) => {

    // the struct that will eventually be returned from calling this method
    var skv_return = {
        success: false,
        msg: 'fail',
        data: {}
    };

    var api_cfg = skv_cfg.api_cfg;
    var skv_img_cfg = skv_cfg.skv_img_cfg;

    // TODO: encode
    var str_encoded_search = skv_cfg.search_terms;

    // path to call the API to get movie detail
    var movie_db_url = `${api_cfg.paths.base}/search/movie?api_key=${api_cfg.key}&query=${str_encoded_search}`;

    // get the movie details
    return axios.get(movie_db_url)
        // handle response from getting movie details
        .then( (response) => {

            var res_film = response.data.results[0];

            // struct of values that will be returned
            skv_return.data = {
                id  : res_film.id,
                title   : res_film.title,
                img_path: {
                    backdrop    : `${skv_img_cfg.images.secure_base_url}${skv_img_cfg.images.backdrop_sizes[2]}${res_film.backdrop_path}`,
                    poster      : `${skv_img_cfg.images.secure_base_url}${skv_img_cfg.images.poster_sizes[5]}${res_film.poster_path}`
                }
            
            };

            // now we have the movie id get extra movie details
            var movie_details_url = `${api_cfg.paths.base}/movie/${skv_return.data.id}?api_key=${api_cfg.key}`;
            // themoviedb allows merging responses to reduce api calls
            // attach to the returned json released dates based on region and type of release (theatrical, home etc)
            movie_details_url += '&append_to_response=release_dates';

            return axios.get(movie_details_url)

        }).then( (response) => {

            // store regions to be used later
            var arr_regions = response.data.release_dates.results;

            // -------------- FINANCE WITHOUT INFLATION --------------
            skv_return.data.finance = {
                no_inflation : {
                    budget: response.data.budget,
                    revenue: response.data.revenue,
                    get gross () {
                        return this.revenue - this.budget;
                    },
                },
                // the date that these finance details are based on (probably the US theatrical release date)
                release_date: response.data.release_date 
            };
// console.log('here in movies');
//             return finance.getTicketPrices();
// return true;
        // }).then( (response) => {

            // get the inflation rate for US and the selected country
            return finance.getInflationRate({
                region_code: skv_cfg.region_code,
                from_date: response.data.release_date
            });

        }).then( (response) => {
            // handle the data come back from inflation rates promise/api call

            var num_rate_percentage = Number(response.data);

            // -------------- US FINANCE WITH INFLATION --------------
            var rate_factor = (num_rate_percentage + 100) / 100;

            // apply inflation to our existing financials
            var inc_inflation = {
                percentage: num_rate_percentage,
                budget : Math.round(skv_return.data.finance.no_inflation.budget * rate_factor),
                revenue: Math.round(skv_return.data.finance.no_inflation.revenue * rate_factor),
                get gross () {
                    return this.revenue - this.budget;
                },
            };

            skv_return.data.finance.inc_inflation = inc_inflation;


            // ------- RELEASE DATES------------
            
            // get just the release date info from the specified region code
            var skv_region = arr_regions.filter( (skv_region) => {
                return skv_region.iso_3166_1 === skv_cfg.region_code;
            })[0];

            // loop through each region and find the correct region based on passed in region code
            skv_region.release_dates.forEach( (skv_release_date, idx) => {

                // for each type of release work out how long ago it was and include formatting
                skv_region.release_dates[idx] = applyElapsedTimes(skv_region.release_dates[idx]);

            });       

            skv_return.data.region = skv_region;
            
            skv_return.success = true;
            skv_return.msg = 'success';

            return skv_return;

        }).catch( (e) => {
            
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

// only get the oldest first date for each type of release
getFirstReleaseOfType = (skv_region) => {

    //  key of types of releases 
    //  1. Premiere
    //  2. Theatrical (limited)
    //  3. Theatrical
    //  4. Digital
    //  5. Physical
    //  6. TV
    var arr_types = [1,2,3,4,5,6];

    var release_dates = skv_region.release_dates; 

    // array of unique releases to be returned
    var arr_unique_releases = [];

    // loop through the release types
    arr_types.forEach( (release_key, idx) => {

        var temp_array = [];
        var is_first = true;

        // check against each release date struct
        release_dates.forEach( (skv_release_date) => {

            // if its not the first instance of this type and it matches the current key
            // add to an array of unique release types
            if(
                skv_release_date.type === release_key &&
                is_first
            ) {
                // make a new entry
                arr_unique_releases.push(skv_release_date);
                // no longer allow any new entries
                is_first = false;
            }

        });


    });

    // update the old releases with only unique release types
    skv_region.release_dates = arr_unique_releases; 

    return skv_region;

}

applyElapsedTimes = (skv_release_date) => {

    // get a human readable releaes date
    skv_release_date.text = dates.getFormattedDateOutput(skv_release_date.release_date);

    // find out how many ms ago it was
    skv_release_date.how_long_ago = dates.getDifferenceMSBetween2Dates( new Date(), 
                                                                        new Date(skv_release_date.release_date)
                                                                      );

    // format ms in to text
    skv_release_date.how_long_ago_text = dates.getFormattedMSoutput(skv_release_date.how_long_ago).text;


    return skv_release_date;
}


// expose the function to be used by whatever is importing this module 
module.exports = {
    getMovie
};