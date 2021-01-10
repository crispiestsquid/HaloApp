const axios = require('axios');
const halo_api = "https://www.haloapi.com";
const api_key = require('../config').haloApiKey;

axios.defaults.headers = {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': api_key
};

//status: 429 is api limit reached

// Add a response interceptor
axios.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  }, async function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.response.status == 429) {
	    // API limit reached; wait time and try again
	    let retry_time = Number(error.response.headers['retry-after']) * 1000
	    await new Promise(resolve => setTimeout(resolve,retry_time));
	    return axios.request(error.config);
    }
    return Promise.reject(error);
  });

module.exports = axios 
