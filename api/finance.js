const axios = require('axios');

// const { Client } = require('pg');
const connection_string = 'postgres://tedncwwegrldnk:238805d2643b210ba7f5cd9b1690243c0ab7e359f330c2d8a84918c1b2361d74@ec2-46-137-99-175.eu-west-1.compute.amazonaws.com:5432/df6hge0mkgf5aq?ssl=true';



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

    // TODO: need to map region codes and countries like statbureau use

    api_path = `${api_path}?country=united-states&start=${start_date}&end=${formatted_now_date}`

    return axios.get(api_path);

};

var getTicketPrices = (skv_cfg) => {
console.log('here');
    // create connection
    return client.connect(connection_string, function(err, client, done) {
console.log(err);
        var str_query = 'SELECT * FROM ticketprices';
    
        client.query(str_query, (err, res) => {
    console.log('err: ', err);
    console.log('res: ', res);
            if (err) throw err;
    
            for (let row of res.rows) {
                console.log(JSON.stringify(row));
            }
    
            client.end();
        });

    });


};










module.exports = {
    getInflationRate,
    getTicketPrices
};