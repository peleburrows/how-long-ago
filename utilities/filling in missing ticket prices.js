//utility script to fill in the missing years provided by box office mojo

const arr_years =[ 
  { year: 2019, cost: '8.83' },
  { year: 2018, cost: '9.14' },
  { year: 2017, cost: '8.97' },
  { year: 2016, cost: '8.65' },
  { year: 2015, cost: '8.43' },
  { year: 2014, cost: '8.17' },
  { year: 2013, cost: '8.13' },
  { year: 2012, cost: '7.96' },
  { year: 2011, cost: '7.93' },
  { year: 2010, cost: '7.89' },
  { year: 2009, cost: '7.50' },
  { year: 2008, cost: '7.18' },
  { year: 2007, cost: '6.88' },
  { year: 2006, cost: '6.55' },
  { year: 2005, cost: '6.41' },
  { year: 2004, cost: '6.21' },
  { year: 2003, cost: '6.03' },
  { year: 2002, cost: '5.81' },
  { year: 2001, cost: '5.66' },
  { year: 2000, cost: '5.39' },
  { year: 1999, cost: '5.08' },
  { year: 1998, cost: '4.69' },
  { year: 1997, cost: '4.59' },
  { year: 1996, cost: '4.42' },
  { year: 1995, cost: '4.35' },
  { year: 1994, cost: '4.18' },
  { year: 1993, cost: '4.14' },
  { year: 1992, cost: '4.15' },
  { year: 1991, cost: '4.21' },
  { year: 1990, cost: '4.23' },
  { year: 1989, cost: '3.97' },
  { year: 1988, cost: '4.11' },
  { year: 1987, cost: '3.91' },
  { year: 1986, cost: '3.71' },
  { year: 1985, cost: '3.55' },
  { year: 1984, cost: '3.36' },
  { year: 1983, cost: '3.15' },
  { year: 1982, cost: '2.94' },
  { year: 1981, cost: '2.78' },
  { year: 1980, cost: '2.69' },
  { year: 1979, cost: '2.51' },
  { year: 1978, cost: '2.34' },
  { year: 1977, cost: '2.23' },
  { year: 1976, cost: '2.13' },
  { year: 1975, cost: '2.05' },
  { year: 1974, cost: '1.87' },
  { year: 1973, cost: '1.77' },
  { year: 1972, cost: '1.70' },
  { year: 1971, cost: '1.65' },
  { year: 1970, cost: '1.55' },
  { year: 1969, cost: '1.42' },
  { year: 1968, cost: '1.31' },
  { year: 1967, cost: '1.20' },
  { year: 1966, cost: '1.09' },
  { year: 1965, cost: '1.01' },
  { year: 1964, cost: '0.93' },
  { year: 1963, cost: '0.85' },
  { year: 1962, cost: '0.70' },
  { year: 1961, cost: '0.69' },
  { year: 1959, cost: '0.51' },
  { year: 1956, cost: '0.50' },
  { year: 1954, cost: '0.45' },
  { year: 1953, cost: '0.60' },
  { year: 1951, cost: '0.53' },
  { year: 1949, cost: '0.46' },
  { year: 1948, cost: '0.40' },
  { year: 1945, cost: '0.35' },
  { year: 1944, cost: '0.32' },
  { year: 1943, cost: '0.29' },
  { year: 1942, cost: '0.27' },
  { year: 1941, cost: '0.25' },
  { year: 1940, cost: '0.24' },
  { year: 1939, cost: '0.23' },
  { year: 1936, cost: '0.25' },
  { year: 1935, cost: '0.24' },
  { year: 1934, cost: '0.23' },
  { year: 1929, cost: '0.35' },
  { year: 1924, cost: '0.25' },
  { year: 1910, cost: '0.07' } 
];

var num_end_year = arr_years[0].year;
var num_start_year = arr_years[arr_years.length-1].year;

console.log('num_start_year: ', num_start_year, ' num_end_year: ', num_end_year);

/**
 * Get groups of missing year sequences
 * @param arr_years the entire array of yearly data of prices 
 * @returns an array of numbers in order of missing years 
 */
function getMissingYearSequences(arr_years) {

    var idx = -1;
    var is_new_missing_sequence = true;
    var arr_return = [];

    //loop through if the first year (1910) is less than the most recent (2019)
    while( num_start_year < num_end_year ){

        //find the index of the starting year
        //if its not found then....
        if( findIndex(arr_years, num_start_year) == -1 ) {


            var arr_missing_sequence = [];

            //if we have a new sequence of missing number increment index so that
            // we can create a new entry in to the arr_return
            if(is_new_missing_sequence) {
                idx++;
            } else {
                //get a reference to the existing missing years
                arr_missing_sequence = arr_return[idx];
            }

            //include the year in the missing sequence group
            arr_missing_sequence.push(num_start_year);

            //overwrite the existing or create new entry depending on the idx
            arr_return[idx] = arr_missing_sequence;
    
            //if this if statement fires true again we want this false so it doesn't create a new group
            is_new_missing_sequence = false;

        } else {
            //however if we have a new valid year the next invalid year will be a new sequence
            is_new_missing_sequence = true;        
        }

        num_start_year ++;

    }

    return arr_return;

}


arr_missing_years = getMissingYearSequences(arr_years);

applyMissingYearValues(arr_missing_years);

/**
 * Get groups of missing year sequences
 * @param arr_missing_years the entire array of yearly data of prices 
 * @returns an array of numbers in order of missing years 
 */
function applyMissingYearValues(arr_missing_year_groups) {

    var idx = 0;

    arr_missing_year_groups.forEach( (year_group) => {

        //get the first item in the sequence e.g 1911 and -1 
        //then search on the 1910 which we will have in the data
        start_sequence_year = year_group[0] - 1;
        //idx in the arr_years that we can use to get the value out
        start_sequence_idx =  findIndex(arr_years, start_sequence_year);
        //value we are going to base the calculations on
        start_sequence_value = Number(arr_years[start_sequence_idx].cost);
        //where the sequence ends
        end_sequence_year = year_group[year_group.length-1] + 1;
        //idx in the arr_years that we can use to get the value out
        end_sequence_idx =  findIndex(arr_years, end_sequence_year);
        //value we are going to base the calculations on
        end_sequence_value = Number(arr_years[end_sequence_idx].cost);

        //calculate the missing values and create the same structure
        //to merge with arr_years        
        arr_group_updated = updateMissingYearValues(year_group, start_sequence_value, end_sequence_value);

        insertArrayAt(arr_years, start_sequence_idx, arr_group_updated);

        idx++;

    });



}

console.log(arr_years);

// TODO: replace with ES6 version
// https://stackoverflow.com/questions/1348178/a-better-way-to-splice-an-array-into-an-array-in-javascript
function insertArrayAt(array, index, arrayToInsert) {
    Array.prototype.splice.apply(array, [index, 0].concat(arrayToInsert));
}


/**
 * Get groups of missing year sequences
 * @param arr_missing_years the entire array of yearly data of prices 
 * @returns an array of numbers in order of missing years 
 */
function updateMissingYearValues(arr, start_val, end_val) {

    var arr_return = [];
    var cnt_arr = arr.length;
    var diff = end_val - start_val;

    //divide by number of years but add 1 so we don't end up with the same value for either the 
    //last or first item in the array
    var increment_val = Number(diff / (cnt_arr +1));
    
    for(var idx=0; idx < cnt_arr; idx++) {

        //add to the value we do know a linear stepping of values formatted to 2 decimal places
        var estimated_value = Number(start_val + (increment_val * (idx+1))).toFixed(2);

        var skv_new_year = {
            year: arr[idx],
            cost: estimated_value
        }

        arr_return.push(skv_new_year);

    }

    // TODO: replace with ES6 version
    //sort in to descending order 
    arr_return.sort(function(a, b) {
        return parseFloat(b.year) - parseFloat(a.year);
    });

    return arr_return;

}

/**
 * Get groups of missing year sequences
 * @param arr_missing_years the entire array of yearly data of prices 
 * @returns an array of numbers in order of missing years 
 */
function findIndex(arr, value) {
    return arr.map(x => x.year).indexOf(value);
}