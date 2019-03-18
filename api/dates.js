/**
 * For calculating and manipulating date related inputs
 */

/**
 * Convert a date in to a nicer human readable string
 * @param str_date in 'yyyy-dd-mmm' format
 */
const getFormattedDateOutput = (str_date) => {
  // create a date object using the passed in date so we have access
  // to toLocateDateString below
  const objDate = new Date(str_date);

  // date formatting options
  const date_options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  // convert to nice and readable text
  return objDate.toLocaleDateString('en-US', date_options);
};

/**
* Find the difference in days between now and the date passed in
* the milliseconds in a single day
* hours*minutes*seconds*milliseconds
* var one_day = 24*60*60*1000;
*
* 1. calculate the time difference the date and 1970/01/01
* 2. find the difference in time
* 3. convert from ms to days
* 4. round up
* var diff_days = Math.round(Math.abs((objNowDate.getTime() - objCheckDate.getTime())/(one_day)));
 * @param str_date in 'yyyy-dd-mmm' format
 * @return diff_days the number of days difference between 2 dates
*/
const getDifferenceMSBetween2Dates = (objDate1, objDate2) => Math.abs(objDate1.getTime() - objDate2.getTime());

/**
 * TODO: HANDLE LEAP YEARS
 * Convert to human readable time
 * @param num_ms millisecond value
 * @return text
 */
const getFormattedMSoutput = (num_ms) => {

console.log('num_ms:', num_ms);

  // one day in milliseconds
  const one_day = 24 * 60 * 60 * 1000;

  // convert to days
  const total_num_days = Math.round(num_ms / one_day);

  const y = 365;
  const y2 = 31;
  const remainder = total_num_days % y;
  const casio = remainder % y2;
  const year = (total_num_days - remainder) / y;
  const month = (remainder - casio) / y2;

  const skv_return = {
    split: {
      years: year,
      months: month,
      days: casio,
    },
    text: `${year} years ${month} months ${casio} days`,
    ms: num_ms,
  };

  return skv_return;
};

module.exports = {
  getFormattedDateOutput,
  getDifferenceMSBetween2Dates,
  getFormattedMSoutput,
};
