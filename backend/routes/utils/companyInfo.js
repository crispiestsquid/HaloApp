const axios = require('axios');
const halo_api = "https://www.haloapi.com"
const api_key = process.env.HALO_API_KEY;

axios.defaults.headers = {
       'Content-Type': 'application/json',
       'Ocp-Apim-Subscription-Key': api_key
   }

def getCompanyInfo(conn,headers,company_id):
    try:
        conn.request("GET", "/stats/h5/companies/%s" % company_id, "{body}", headers)
        response = conn.getresponse()
        string = response.read().decode('utf-8')
        json_obj = json.loads(string)
        return json_obj
    except Exception as e:
        print("Unable to perform REQUEST")
        print(e)
        sys.exit(1)


exports.getCompanyInfo = async company_id => {
    let response = await axios.get(`${halo_api}/stats/h5/companies/${company_id}`)
	.then(res => {
	    return res.data;
	})
	.catch( error => {
	    return error;
	})
    return response;
}

// Get Company Object based on a Gamertag
exports.getCompany = async player => {
    let response = await axios.get(`${halo_api}/profile/h5/profiles/${player}/appearance`)
	.then(res => {
	    return res.data;
	})
	.catch(error => {
	    return error;
	})
    return response;
}
