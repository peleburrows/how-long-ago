const axios = require('axios');

// make the errors printed out a bit more legible
// require('pretty-error').start();

const { Client } = require('pg');

const formatCurrency = (num_value, str_region) => {


console.log(Intl);


  // Create our number formatter.
  const formatter = new Intl.NumberFormat(str_region, {
    style: 'currency',
    currency: 'USD',
  });
console.log(formatter);
  return formatter.format(num_value);
};

// gets the overall percentage of inflation between 2 dates
const getInflationRate = (skv_cfg) => {
  // TODO: need to acknowledge statbureau
  let api_path = 'https://www.statbureau.org/calculate-inflation-rate-json';

  // need to convert from xxxx-xx-xx to xxxx/xx/xx
  const start_date = skv_cfg.from_date.replace(/-/g, '/');

  // get the current date
  const objNowDate = new Date();
  // add 1 to accommodate zero based indexed data
  const month = objNowDate.getUTCMonth() + 1;
  const day = objNowDate.getUTCDate();
  const year = objNowDate.getUTCFullYear();
  // put it in a format for the api to understand
  const formatted_now_date = year + '/' + month + '/' + day;

  // TODO: need to map region codes and countries like statbureau use

  api_path = `${api_path}?country=united-states\
&start=${start_date}\
&end=${formatted_now_date}`;

  return axios.get(api_path);
};

const getTicketPrices = () => {
  const connection_string = 'postgres://tedncwwegrldnk:238805d2643b210ba7f5cd9b1690243c0ab7e359f330c2d8a84918c1b2361d74@ec2-46-137-99-175.eu-west-1.compute.amazonaws.com:5432/df6hge0mkgf5aq';

  // instantiate a new client (clients are cheap to instantiate). clients should
  // be considered 'used up' once they've been disconnected
  // create a new client to ensure old event handlers don't interfere if we were
  // to reopen the connection
  const client = new Client({
    connectionString: connection_string,
    ssl: true,
  });

  // create connection
  client.connect();

  // query to use
  const str_query = 'SELECT * FROM ticketprices';

  // run the promise
  return client.query(str_query)
    .then((result) => {
      // we need to close the connection
      // or it'll error on refresh
      client.end();
      return result;
    });
};

/**
 * Get the ticket prices, inflation adjusted values
 * @param skv_cfg struct with budget, revenue, release_date, region_code
 */
const getFinancials = (skv_cfg) => {
  // we've already got some things that can be put straight in to a returned struct
  const skv_return = {
    no_inflation: {
      budget: skv_cfg.budget,
      budget_formatted: formatCurrency(this.budget, 'en-US'),
      revenue: skv_cfg.revenue,
      revenue_formatted: formatCurrency(this.revenue, 'en-US'),
      get gross() {
        return this.revenue - this.budget;
      },
    },
    // the date that these finance details are based on (probably the US theatrical release date)
    release_date: skv_cfg.release_date,
  };

  return getTicketPrices()
    .then((response) => {
      // include in the overall return object
      // we will add inflation a bit later
      skv_return.no_inflation.ticket_prices = response.rows;
      // get the release year
      const objReleaseDate = new Date(skv_return.release_date);
      const release_year = objReleaseDate.getUTCFullYear();

      // get the index of the ticket prices array that matches
      // the year of the film
      const selected_yr_idx = response.rows.map(x => x.year).indexOf(release_year);
      // attach the release yaer ticket price
      skv_return.no_inflation.ticket_price = Number(response.rows[selected_yr_idx].cost);
      // get the inflation rate for US and the selected country
      return getInflationRate({
        region_code: skv_cfg.region_code,
        from_date: skv_return.release_date,
      });
    })
    // handle the data come back from inflation rates promise/api call
    .then((response) => {
      const num_rate_percentage = Number(response.data);

      // -------------- US FINANCE WITH INFLATION --------------
      const rate_factor = (num_rate_percentage + 100) / 100;
      const ticket_price = skv_return.no_inflation.ticket_price * rate_factor;

      // apply inflation to our existing financials
      const inc_inflation = {
        percentage: num_rate_percentage,
        budget: Math.round(skv_return.no_inflation.budget * rate_factor),
        revenue: Math.round(skv_return.no_inflation.revenue * rate_factor),
        get gross() {
          return this.revenue - this.budget;
        },
        ticket_price: Math.round(ticket_price * 100) / 100,
      };

      skv_return.inc_inflation = inc_inflation;

      return skv_return;
    });
};

module.exports = {
  getFinancials,
};
