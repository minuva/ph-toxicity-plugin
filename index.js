/* global module */
/* eslint no-undef: "error" */

// Plugin method that runs on plugin load
async function setupPlugin({ config }) {

}

async function makePostRequest(url, data) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Accept": "*/*"
      },
      body: JSON.stringify(data)
    });

    if (response.status === 200) {
      const responseData = await response.json();
      return responseData;
    } else {
      console.error("Request code " + response.status);
      throw new Error("Request failed with status code " + response.status);
    }
  } catch (error) {
    console.error("Error:", error);
    throw error; 
  }
}


function isValidURL(url) {
  try {
    const urlObject = new URL(url);

    // Check if the protocol is either http or https and contains double slash
    const isHttpOrHttps = /^https?:\/\/.*/.test(url);

    // Check if the hostname is an IP address or localhost
    const isIPAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(urlObject.hostname);
    const isLocalhost = urlObject.hostname === 'localhost';

    // If the protocol is not http or https, return false
    if (!isHttpOrHttps) {
      return false;
    }

    // If the hostname is an IP address or localhost, the port must be present
    if ((isIPAddress || isLocalhost) && !urlObject.port) {
      return false;
    }

    // If the hostname is not a valid domain name, IP address, or localhost, return false
    if (!urlObject.hostname && !isIPAddress && !isLocalhost) {
      return false;
    }

    // Check if the hostname ends with a double quote
    if (urlObject.hostname.endsWith('"')) {
      return false;
    }

    // Check if the path contains a double slash
    if (urlObject.pathname.includes('//')) {
      return false;
    }

    return true;
  } catch (e) {
    // Return false if the URL is not valid
    return false;
  }
}


async function processEvent(event, { config, cache }) {
    const path = 'conversation_toxicity_plugin';
    let fullUrl = '';
    let API_SERVER_URL = config.API_SERVER_URL;
    if (isValidURL(API_SERVER_URL)) {
      API_SERVER_URL = API_SERVER_URL.endsWith('/')? API_SERVER_URL : API_SERVER_URL + '/';
      fullUrl = API_SERVER_URL + path;
    }
    else
    {
      console.error('API_SERVER_URL is not a valid URL');
      throw new Error('API_SERVER_URL is not a valid URL');
    }
    if (!event.properties) {
        event.properties = {};
    }
  
    if (
      !event.properties['$llm_input'] || !event.properties['$llm_output']) {
      return event;
    }
    // Check if toxicity properties exist and remove those with values equal to zero
    if (
      event.properties['user_toxicity'] !== undefined ||
      event.properties['user_severe_toxicity'] !== undefined ||
      event.properties['agent_toxicity'] !== undefined ||
      event.properties['agent_severe_toxicity'] !== undefined
    ) {

      for (const prop of ['user_toxicity', 'user_severe_toxicity', 'agent_toxicity', 'agent_severe_toxicity']) {
        if (event.properties[prop] === 0) {
          delete event.properties[prop];
        }
      }
      return event;
    }

    else {
      // if none exist, make call
      let input = event.properties['$llm_input'];
      let llm_output = event.properties['$llm_output'];
      if (Array.isArray(input)) {
        // read the last input and get content
        llm_input = input.slice(-1)[0].content
      }
      else if (typeof input === 'string') {
        llm_input = input;
      }

      var task = {
        "llm_input": llm_input,
        "llm_output": llm_output
      };
      const res = await makePostRequest(fullUrl, task);

      for (const key in res) {
        if (res[key] > 0) {
          event.properties[key] = res[key];
        }
      }
    }

  return event;
}



// The plugin itself
module.exports = {
    setupPlugin,
    processEvent
}
