const axios = require('axios');

const dates = require('./dates');

var skv_return = {
    success: false,
    msg: 'fail',
    data: {}
};


var getPeople = (skv_data) => {

    var api_cfg = skv_data.api_cfg;

    //path to get the cast and crew creditted for a film using an id
    var credits_url =`${api_cfg.paths.base}/movie/${skv_data.film_id}/credits?api_key=${api_cfg.key}`;

    //do the ajax call with the url
    return axios.get(credits_url)
                .then( (response) => {
                    var arr_cast = response.data.cast;

                    //TODO: temporarily restrict length to avoid too many calls to api
                    arr_cast.length = 3;

                    var index = 0;

                    //start going through the cast members getting further details of them
                    return getCastExtraDetail(  skv_data.release_dates,
                                                api_cfg,
                                                arr_cast, 
                                                0
                                            );                  

                })
                .then((response) => {

                    skv_return.success = true,
                    skv_return.msg = 'success',
                    skv_return.data = response

                    return skv_return;
                });
};



//recursive function getting cast details that aren't in the previous film credits call
function getCastExtraDetail(    release_dates,
                                api_cfg,
                                arr_cast, 
                                index
                            ) {

    //create a path using the id for each cast member
    var cast_detail_url = `${api_cfg.paths.base}/person/${arr_cast[index].id}?api_key=${api_cfg.key}`;

    //promised ajax call to get an individual person
    return axios.get(cast_detail_url)
                .then((response) => {

                    //update the current arr_cast with data from the extra detail call
                    arr_cast[index].birthday = response.data.birthday;

                    var objNowDate = new Date();
                    var objBirthdayDate = new Date(arr_cast[index].birthday);

                    arr_cast[index].age = {
                        get now () {
                            var age_ms = dates.getDifferenceMSBetween2Dates(objNowDate, objBirthdayDate);
                            return dates.getFormattedMSoutput(age_ms);
                        }                        
                    };

                    var age_at_releases = [];

                    //for each release date (premiere, theatrical, dvd etc)
                    //find what age they were
                    release_dates.forEach( (release_date, idx) => {

                        //at time of release
                        var age_ms = arr_cast[index].age.now.ms - release_date.how_long_ago;  

                        //store a break down of the age at the time of the film
                        age_at_releases.push(dates.getFormattedMSoutput(age_ms));
                    
                    });

                    //apply to the arr_cast
                    arr_cast[index].at_releases = age_at_releases;

                    //move the pointer on to the next cast member
                    index++;

                    //if we're at the end of the array of cast members
                    //finish recursing...
                    if (index >= arr_cast.length) {
                        return arr_cast;
                    }

                    //...otherwise do another call to get the next cast member
                    return getCastExtraDetail(  release_dates,
                                                api_cfg,
                                                arr_cast,
                                                index
                                            );
                });

}




//allow functions to be called from when this module is imported elsewhere
module.exports = {
    getPeople
};