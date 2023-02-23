const request = require("request");

const get_http_options = (http_host, macaroon) =>{
  return {
    url: `https://${http_host}/v1/taro/`,
    // Work-around for self-signed certificates.
    rejectUnauthorized: false,
    json: true,
    headers: {
      "Grpc-Metadata-macaroon": macaroon.toString("hex"),
    },
  };
}

const mintAsset = (
  host,
  macaroon,
  name,
  metadata,
  amount,
  asset_type = "NORMAL",
  enable_emission = false,
  skip_batch = true
) =>{
  let options = get_http_options(host, macaroon);
  options.url += "assets";
  let requestBody = {
    asset_type: asset_type,
    name: name,
    meta_data: Buffer.from(JSON.stringify(metadata)).toString("base64"),
    amount: amount,
    enable_emission: enable_emission,
    skip_batch: skip_batch,
  };
  options.form = JSON.stringify(requestBody);
  console.log("Options: " + JSON.stringify(options));
  return new Promise((resolve, reject) => {
    request.post(options, function (error, response, body) {
      if (error) {
        console.log("Error mininting asset", error);
        reject(error);
      } else {
        console.log("Response minting asset: ", JSON.stringify(body));
        resolve(body);
      }
    });
  });
}

const getAssetList = (host, macaroon) =>{
  let options = get_http_options(host, macaroon);
  options.url += "assets";
  console.log("Options: " + JSON.stringify(options));
  return new Promise((resolve, reject) => {
    request.get(options, function (error, response, body) {
      if (error) {
        console.log("Error getting asset", error);
        reject(error);
      } else {
        console.log("Response getting asset: ", JSON.stringify(body));
        resolve(body);
      }
    });
  });
}

const getAssetBalance = (host, macaroon) =>{
  let options = get_http_options(host, macaroon);
  options.url += "assets/balance";
  console.log("Options: " + JSON.stringify(options));
  return new Promise((resolve, reject) => {
    request.get(options, function (error, response, body) {
      if (error) {
        console.log("Error getting asset balances", error);
        reject(error);
      } else {
        console.log("Response getting asset balances: ", JSON.stringify(body));
        resolve(body);
      }
    });
  });
}

const newNodeAddr = (host, macaroon, genesis_bootstrap_info, amount) =>{
  let options = get_http_options(host, macaroon);
  options.url += "addrs";
  let requestBody = {
    genesis_bootstrap_info: genesis_bootstrap_info,
    amt: amount, // <int64>
  };
  options.form = JSON.stringify(requestBody);
  console.log("Options: " + JSON.stringify(options));
  return new Promise((resolve, reject) => {
    request.post(options, function (error, response, body) {
      if (error) {
        console.log("Error generating address", error);
        reject(error);
      } else {
        console.log("Response generating address: ", JSON.stringify(body));
        resolve(body);
      }
    });
  });
}

const sendAssets = (host, macaroon, asset_address) =>{
  let options = get_http_options(host, macaroon);
  options.url += "send";
  let requestBody = {
    taro_addr: asset_address, // <string>
  };
  options.form = JSON.stringify(requestBody);
  console.log("Options: " + JSON.stringify(options));
  return new Promise((resolve, reject) => {
    request.post(options, function (error, response, body) {
      if (error) {
        console.log("Error sending asset", error);
        reject(error);
      } else {
        console.log("Response sending asset: ", JSON.stringify(body));
        resolve(body);
      }
    });
  });
}

const exportProof = (host, macaroon, asset_id, script_key) =>{
  let options = get_http_options(host, macaroon);
  options.url += "proofs/export";
  let requestBody = {
    asset_id: asset_id,
    script_key: script_key, // <bytes> (base64 encoded)
  };
  options.form = JSON.stringify(requestBody);
  console.log("Options: " + JSON.stringify(options));
  return new Promise((resolve, reject) => {
    request.post(options, function (error, response, body) {
      if (error) {
        console.log("Error exporting proof", error);
        reject(error);
      } else {
        console.log("Response exporting proof: ", JSON.stringify(body));
        resolve(body);
      }
    });
  });
}

const importProof = (host, macaroon, raw_proof) =>{
  let options = get_http_options(host, macaroon);
  options.url += "proofs/import";
  // let proof_file_path = config['PROOF_FILE'] + '/' + asset_id + "/" + script_key + ".taro";
  let requestBody = {
    proof_file: raw_proof, //: <string>, // <string>
  };
  options.form = JSON.stringify(requestBody);
  console.log("Options: " + JSON.stringify(options));
  return new Promise((resolve, reject) => {
    request.post(options, function (error, response, body) {
      if (error) {
        console.log("Error importing proof", error);
        reject(error);
      } else {
        console.log("Response importing proof: ", JSON.stringify(body));
        resolve(body);
      }
    });
  });
}

const verifyProof = (host, macaroon, raw_proof, genesis_point) =>{
  let options = get_http_options(host, macaroon);
  options.url += "proofs/verify";
  let requestBody = {
    ...raw_proof,
    ...genesis_point, //: <string>, // <string>
  };
  options.form = JSON.stringify(requestBody);
  console.log("Options: " + JSON.stringify(options));
  return new Promise((resolve, reject) => {
    request.post(options, function (error, response, body) {
      if (error) {
        console.log("Error verifying proof", error);
        reject(error);
      } else {
        console.log("Response verifying proof: ", JSON.stringify(body));
        resolve(body);
      }
    });
  });
}

module.exports = {
    mintAsset: mintAsset,
    getAssetList: getAssetList,
    getAssetBalance: getAssetBalance,
    newNodeAddr: newNodeAddr,
    sendAssets: sendAssets,
    exportProof: exportProof,
    importProof: importProof,
    verifyProof: verifyProof
}