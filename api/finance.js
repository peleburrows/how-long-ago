const axios = require('axios');

const { Client } = require('pg');

// setup the connection but we will connect during the promise when called
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  // SSL connections required for Heroku Postgres
  ssl: true,
});



// gets the overall percentage of inflation between 2 dates
var getInflationRate = (skv_cfg) => {

    // TODO: need to acknowledge statbureau
    var api_path = 'https:// www.statbureau.org/calculate-inflation-rate-json';

    // need to convert from xxxx-xx-xx to xxxx/xx/xx
    var start_date = skv_cfg.from_date.replace(/-/g, '/');

    // get the current date 
    var objNowDate = new Date();
    // add 1 to accommodate zero based indexed data
    var month = objNowDate.getUTCMonth() + 1; 
    var day = objNowDate.getUTCDate();
    var year = objNowDate.getUTCFullYear();
    // put it in a format for the api to understand
    formatted_now_date = year + "/" + month + "/" + day;

    //  TODO: need to map region codes and countries like statbureau use

    api_path = `${api_path}?country=united-states&start=${start_date}&end=${formatted_now_date}`

    return axios.get(api_path);

};

var getInflationRate = (skv_cfg) => {





};










module.exports = {
    getInflationRate
};