// // get form eleemnet to listen to when its submitted
// const frm_search = document.querySelector('#search-form');

// function formSubmitted(skv_cfg) {
//   axios.get('/movie', {
//     params: skv_cfg,
//   })
//   .then((response) => {
//     console.log(response);
//   })
//   .catch((error) => {
//     console.log(error);
//   })
//   .then(() => {
//     // always executed
//   });  
// }

// // listen to when the form is submitted
// frm_search.addEventListener('submit', (e) => {
//   e.preventDefault();
//   // form element
//   const el_form = e.target;
//   // the struct to send to send via ajax to the api
//   const skv_send_cfg = {
//     search_terms: el_form.querySelector('#input-title').value,
//     region_code: el_form.querySelector('#select-region ').value,
//   };

//   formSubmitted(skv_send_cfg);
// });
