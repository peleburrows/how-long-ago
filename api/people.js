const axios = require('axios');

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

                    //recursive function getting cast details that aren't in the previous film credits call
                    function getCastExtraDetail() {

                        //create a path using the id for each cast member
                        var cast_detail_url = `${api_cfg.paths.base}/person/${arr_cast[index].id}?api_key=${api_cfg.key}`;

                        //promised ajax call to get an individual person
                        return axios.get(cast_detail_url)
                                    .then((response) => {

                                        //update the current arr_cast with data from the extra detail call
                                        arr_cast[index].birthday = response.data.birthday;

                                        index++;

                                        //if we're at the end of the array of cast members
                                        //finish recursing...
                                        if (index >= arr_cast.length) {
                                            return arr_cast;
                                        }

                                        //...otherwise do another call to get the next cast member
                                        return getCastExtraDetail();
                                    });
                
                    }

                    //start going through the cast members getting further details of them
                    return getCastExtraDetail();                  

                }).
                then((response) => {

                    skv_return.success = true,
                    skv_return.msg = 'success',
                    skv_return.data = response

                    return skv_return;
                });
};

//allow functions to be called from when this module is imported elsewhere
module.exports = {
    getPeople
};