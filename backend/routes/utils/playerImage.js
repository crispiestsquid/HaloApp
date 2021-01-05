const axios = require('axios');
const halo_api = "https://www.haloapi.com";
const api_key = require('../../config').haloApiKey;

axios.defaults.headers = {
	'Content-Type': 'application/json',
	'Ocp-Apim-Subscription-Key': api_key
};

// Get Player Emblem from Gamertag
const getEmblem = async (gamertag, size = null) => {
    let url = size ? `${halo_api}/profile/h5/profiles/${gamertag}/emblem?size=${size}` : `${halo_api}/profile/h5/profiles/${gamertag}/emblem`;
	let response = await axios.get(url, {
        responseType: 'stream'
    })
	.then(res => {
		return res;
	})
	.catch(err => {
		return err;
	});
	return response;
};

const getMultipleEmblems = async (gamertags, size = null) => {
    let emblemUrls = [];
    let emblemCalls = []

    gamertags.forEach(gamertag => {
        emblemCalls.push(getEmblem(gamertag, size));
    });

    await Promise.allSettled(emblemCalls)
    .then(results => {
        results.forEach((result, i) => {
            if (result.status === "fulfilled") {
                let data = {
                    gamertag: gamertags[i],
                    emblemUrl: result.value.data.responseUrl
                }
                emblemUrls.push(data);
            }
        });
    });
    return emblemUrls;
};

module.exports = { getEmblem, getMultipleEmblems };
