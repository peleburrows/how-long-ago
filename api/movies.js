const axios = require('axios');

// date formatting, millisecond conversion
const dates = require('./dates');

// for getting inflation for selected country
const finance = require('./finance');

/**
 * Description
 * @param struct skv_release_date  A single release type (theatrical, dvd etc)
 * @return Length of time thats elapsed wsince release in ms and text
 */
const applyElapsedTimes = (skv_release_date) => {
  const local_skv_release_date = skv_release_date;
  // get a human readable releaes date
  local_skv_release_date.text = dates.getFormattedDateOutput(local_skv_release_date.release_date);

  // find out how many ms ago it was
  local_skv_release_date.how_long_ago = dates.getDifferenceMSBetween2Dates(
    new Date(),
    new Date(local_skv_release_date.release_date),
  );

  // format ms in to text
  local_skv_release_date.how_long_ago_text = dates.getFormattedMSoutput(
    skv_release_date.how_long_ago,
  ).text;

  return skv_release_date;
};

/**
 * Retrieve information on movies based on title and region code
 * @param struct skv_cfg region code, movie title
 */
const getMovies = (skv_cfg) => {
  // the struct that will eventually be returned from calling this method
  const skv_return = {
    success: false,
    msg: 'fail',
    data: {},
  };

  const api_cfg = skv_cfg.api_cfg;
  const skv_img_cfg = skv_cfg.skv_img_cfg;

  // TODO: encode
  const str_encoded_search = skv_cfg.search_terms;

  // path to call the API to get movie detail
  const movie_db_url = `${api_cfg.paths.base}/search/movie\
?api_key=${api_cfg.key}\
&query=${str_encoded_search}`;

  // get the movie details
  return axios.get(movie_db_url)
    // handle response from getting movie details
    .then((response) => {

      const skv_return = {
        success: false,
        msg: 'fail',
        data: [],
      };


      const arr_films = response.data.results;

      const cnt_films = arr_films.length;

      for (let i = 0; i < cnt_films; i += 1) {
        const skv_film = arr_films[i];

        skv_film.full_poster_path = `${skv_img_cfg.images.secure_base_url}\
${skv_img_cfg.images.poster_sizes[1]}\
${skv_film.poster_path}`;

      }

//       skv_return.data = {
//         id: res_film.id,
//         title: res_film.title,
//         img_path: {
//           backdrop: `${skv_img_cfg.images.secure_base_url}\
// ${skv_img_cfg.images.backdrop_sizes[2]}\
// ${res_film.backdrop_path}`,
//           poster: `${skv_img_cfg.images.secure_base_url}\
// ${skv_img_cfg.images.poster_sizes[5]}\
// ${res_film.poster_path}`,
//         },
//       };


      skv_return.success = true;
      skv_return.msg = 'success';
      skv_return.data = arr_films;

      return skv_return;

    })

  };

/**
 * Retrieve full information on movie based id
 * @param id movie id
 */
const getFullMovieById = (id) => {
  // the struct that will eventually be returned from calling this method
//   const skv_return = {
//     success: false,
//     msg: 'fail',
//     data: {},
//   };

//       // struct of values that will be returned
//       skv_return.data = {
//         id: res_film.id,
//         title: res_film.title,
//         img_path: {
//           backdrop: `${skv_img_cfg.images.secure_base_url}\
// ${skv_img_cfg.images.backdrop_sizes[2]}\
// ${res_film.backdrop_path}`,
//           poster: `${skv_img_cfg.images.secure_base_url}\
// ${skv_img_cfg.images.poster_sizes[5]}\
// ${res_film.poster_path}`,
//         },
//       };

//       // now we have the movie id get extra movie details
//       let movie_details_url = `${api_cfg.paths.base}/movie/\
// ${skv_return.data.id}\
// ?api_key=${api_cfg.key}`;

//       // themoviedb allows merging responses to reduce api calls
//       // attach to the returned json released dates based on region and type
//       // of release (theatrical, home etc)
//       movie_details_url += '&append_to_response=release_dates';

//       return axios.get(movie_details_url);
//     }).then((response) => {
//       // store regions to be used later
//       skv_return.data.regions = response.data.release_dates.results;

//       const finance_cfg = {
//         budget: response.data.budget,
//         revenue: response.data.revenue,
//         release_date: response.data.release_date,
//         region_code: skv_cfg.region_code,
//       };

//       // handle things like ticket prices, gross revenue, inflation adjustments
//       return finance.getFinancials(finance_cfg);
//     }).then((response) => {
//       skv_return.data.finance = response;

//       // ------- RELEASE DATES------------

//       // get just the release date info from the specified region code
//       const skv_region = skv_return.data.regions.filter(skv_region_to_check => skv_region_to_check.iso_3166_1 === skv_cfg.region_code)[0];

//       // we won't have a region if the user sent region code doesn't match up with
//       // any regions the movie was released in
//       if (!skv_region) {
//         throw new Error('Movie not found in the specified region');
//       }

//       // there may be multiple release dates for different types of releases
//       // loop through them here
//       skv_region.release_dates.forEach((skv_release_date, idx) => {
//         // for each type of release work out how long ago it was and include formatting
//         skv_region.release_dates[idx] = applyElapsedTimes(skv_region.release_dates[idx]);
//       });

//       skv_return.data.selected_region = skv_region;

//       // we're now ready to return the data back to retrieve.js
//       skv_return.success = true;
//       skv_return.msg = 'success';

//       return skv_return;
//     })
//     .catch((e) => {
//       let err_msg = '';

//       if (e.message) {
//         err_msg = e.message;
//       } else {
//         err_msg = 'Not able to connect to api servers';
//       }

//       return {
//         success: false,
//         msg: err_msg,
//         err_object: e,
//         data: {},
//       };
//     });
};









// only get the oldest first date for each type of release
// const getFirstReleaseOfType = (skv_region) => {

//   const local_skv_region = skv_region;
//   //  key of types of releases
//   //  1. Premiere
//   //  2. Theatrical (limited)
//   //  3. Theatrical
//   //  4. Digital
//   //  5. Physical
//   //  6. TV
//   const arr_types = [1, 2, 3, 4, 5, 6];

//   const release_dates = skv_region.release_dates;

//   // array of unique releases to be returned
//   const arr_unique_releases = [];

//   // loop through the release types
//   arr_types.forEach((release_key) => {
//     let is_first = true;

//     // check against each release date struct
//     release_dates.forEach((skv_release_date) => {
//       // if its not the first instance of this type and it matches the current key
//       // add to an array of unique release types
//       if (
//         skv_release_date.type === release_key &&
//         is_first
//       ) {
//         // make a new entry
//         arr_unique_releases.push(skv_release_date);
//         // no longer allow any new entries
//         is_first = false;
//       }
//     });
//   });

//   // update the old releases with only unique release types
//   local_skv_region.release_dates = arr_unique_releases;

//   return local_skv_region;
// };


// expose the function to be used by whatever is importing this module
module.exports = {
  getMovies,
  getFullMovieById,
};
