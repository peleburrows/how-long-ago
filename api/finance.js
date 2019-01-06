const axios = require('axios');


const { Client } = require('pg');
const connection_string = 'postgres://tedncwwegrldnk:238805d2643b210ba7f5cd9b1690243c0ab7e359f330c2d8a84918c1b2361d74@ec2-46-137-99-175.eu-west-1.compute.amazonaws.com:5432/df6hge0mkgf5aq';

const client = new Client({
  connectionString: connection_string,
  ssl: true
});

/**
 * Get the ticket prices, inflation adjusted values
 * @param skv_cfg struct with budget, revenue, release_date, region_code 
 */
var getFinancials = (skv_cfg) => {

  //we've already got some things that can be put straight in to a returned struct
  var skv_return = {
    no_inflation : {
      budget: skv_cfg.budget,
      revenue: skv_cfg.revenue,
      get gross () {
          return this.revenue - this.budget;
      }
    },
    // the date that these finance details are based on (probably the US theatrical release date)
    release_date: skv_cfg.release_date 
  };

  return getTicketPrices()
    .then( (response) => {

          // include in the overall return object
          // we will add inflation a bit later
          skv_return.no_inflation.ticket_prices = response.rows;

          //get the release year
          var release_date = skv_return.release_date;            
          var objReleaseDate = new Date(release_date);
          var release_year = objReleaseDate.getUTCFullYear();
  
          // get the index of the ticket prices array that matches 
          // the year of the film
          var selected_yr_idx = response.rows.map(x => x.year).indexOf(release_year);

          //attach the release yaer ticket price
          skv_return.no_inflation.ticket_price = Number(response.rows[selected_yr_idx].cost);

          // get the inflation rate for US and the selected country
          return getInflationRate({
              region_code: skv_cfg.region_code,
              from_date: release_date
          });

    }).then( (response) => {
          // handle the data come back from inflation rates promise/api call

          var num_rate_percentage = Number(response.data);

          // -------------- US FINANCE WITH INFLATION --------------
          var rate_factor = (num_rate_percentage + 100) / 100;

          var ticket_price = skv_return.no_inflation.ticket_price * rate_factor;

          // apply inflation to our existing financials
          var inc_inflation = {
              percentage: num_rate_percentage,
              budget : Math.round(skv_return.no_inflation.budget * rate_factor),
              revenue: Math.round(skv_return.no_inflation.revenue * rate_factor),
              get gross () {
                  return this.revenue - this.budget;
              },
              ticket_price : Math.round(ticket_price * 100) / 100
          };

          skv_return.inc_inflation = inc_inflation;

          return skv_return;

      }).catch( (e) => {

      });

};



// gets the overall percentage of inflation between 2 dates
var getInflationRate = (skv_cfg) => {

    // TODO: need to acknowledge statbureau
    var api_path = 'https://www.statbureau.org/calculate-inflation-rate-json';

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

    // TODO: need to map region codes and countries like statbureau use

    api_path = `${api_path}?country=united-states&start=${start_date}&end=${formatted_now_date}`

    return axios.get(api_path);

};

var getTicketPrices = () => {

    // create connection
    client.connect();
    // TODO: error handling
    // query to use
    var str_query = 'SELECT * FROM ticketprices';
    
    //run the promise
    return client.query(str_query);

};

module.exports = {
    getFinancials
};