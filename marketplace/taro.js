const fs = require('fs');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const request = require('request');

const config = {
  "alice":{
    "GRPC_HOST":"localhost:10029",
    "HTTP_HOST": "localhost:8089",
    "MACAROON_PATH": "/home/nehaparab/taro/.taro-alice/data/regtest/admin.macaroon",
    "TLS_PATH": "/home/nehaparab/taro/.taro-alice/tls.cert",
    "PROOF_FILE": "/home/nehaparab/taro/.taro-alice/data/regtest/proofs"
  },
  "bob":{
    "GRPC_HOST":"localhost:10030",
    "HTTP_HOST": "localhost:8090",
    "MACAROON_PATH": "/home/nehaparab/taro/.taro-bob/data/regtest/admin.macaroon",
    "TLS_PATH": "/home/nehaparab/taro/.taro-bob/tls.cert",
    "PROOF_FILE": "/home/nehaparab/taro/.taro-bob/data/regtest/proofs"
  },
  "carol":{
    "GRPC_HOST":"localhost:10031",
    "HTTP_HOST": "localhost:8091",
    "MACAROON_PATH": "/home/nehaparab/taro/.taro-carol/data/regtest/admin.macaroon",
    "TLS_PATH": "/home/nehaparab/taro/.taro-carol/tls.cert",
    "PROOF_FILE":"/home/nehaparab/taro/.taro-carol/data/regtest/proofs"
  }
}
const clients = {}

// alias tarocli-alice='tarocli --rpcserver=127.0.0.1:10029 --tarodir=~/taro/.taro-alice -n regtest'
// alias tarocli-bob='tarocli --rpcserver=127.0.0.1:10030 --tarodir=~/taro/.taro-bob -n regtest'
// alias tarocli-carol='tarocli --rpcserver=127.0.0.1:10031 --tarodir=~/taro/.taro-carol -n regtest'

const loaderOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};
const packageDefinition = protoLoader.loadSync('/home/nehaparab/Projects/TBTL/taro/tarorpc/taro.proto', loaderOptions);
const tarorpc = grpc.loadPackageDefinition(packageDefinition).tarorpc;
process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';

const get_grpc_client = (clientStr) => {
  const cliConfig = config[clientStr];
  const TLS_PATH = cliConfig['TLS_PATH'];
  const MACAROON_PATH = cliConfig['MACAROON_PATH'];
  const GRPC_HOST = cliConfig['GRPC_HOST'];
  const tlsCert = fs.readFileSync(TLS_PATH);
  console.log("Able to get TLS certificate for ", clientStr, " ", TLS_PATH);
  const sslCreds = grpc.credentials.createSsl(tlsCert);
  console.log("Able to get ssl credentials for ", clientStr);
  const macaroon = fs.readFileSync(MACAROON_PATH).toString('hex');
  console.log("Able to get macaroon for ", clientStr, " ", MACAROON_PATH);
  const macaroonCreds = grpc.credentials.createFromMetadataGenerator((args, callback) =>{
    let metadata = new grpc.Metadata();
    metadata.add('macaroon', macaroon);
    callback(null, metadata);
  });
  console.log("Able to get macaroonCreds for ", clientStr);
  let creds = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);
  console.log("Able to get macaroonCreds for ", clientStr);
  let CLIENT = new tarorpc.Taro(GRPC_HOST, creds);
  return CLIENT;
}

const get_http_options = (clientStr) => {
  const cliConfig = config[clientStr];
  const MACAROON_PATH = cliConfig['MACAROON_PATH'];
  const HTTP_HOST = cliConfig['HTTP_HOST'];
  return {
    url: `https://${HTTP_HOST}/v1/taro/`,
    // Work-around for self-signed certificates.
    rejectUnauthorized: false,
    json: true,
    headers: {
      'Grpc-Metadata-macaroon': fs.readFileSync(MACAROON_PATH).toString('hex'),
    }
  }
}
/**
 * Taro clients
 */
let GRPC_CLIENTS = {
  "alice": get_grpc_client("alice"),
  "bob": get_grpc_client("bob"),
  "carol": get_grpc_client("carol")
}

let HTTP_OPTIONS = {
  "alice": get_http_options("alice"),
  "bob": get_http_options("bob"),
  "carol": get_http_options("carol")
}

const mintAsset = (clientStr, name, metadata, amount, enable_emission=false, skip_batch=true, asset_type="normal") => {
  let options = HTTP_OPTIONS[clientStr];
  options.url += 'assets';
  let requestBody = {
    asset_type: "COLLECTIBLE",
    name: name, 
    meta_data: Buffer.from(JSON.stringify(metadata)).toString("base64"),
    amount: '1',
    enable_emission: enable_emission,
    skip_batch: skip_batch
  };
  options.form = JSON.stringify(requestBody);
  console.log("Options: " + JSON.stringify(options));
  return new Promise((resolve, reject) => {
    request.post(options, function(error, response, body) {
      if (error) {
        console.log("Error mininting asset", error);
        reject(error);
      } else {
        console.log("Response minting asset: ", JSON.stringify(body));
        resolve(body);
      }
    });  
  })
}

const getAssetList = (clientStr) => {
  let options = HTTP_OPTIONS[clientStr];
  options.url += 'assets';
  console.log("Options: " + JSON.stringify(options));
  return new Promise((resolve, reject) => {
    request.get(options, function(error, response, body) {
      if (error) {
        console.log("Error getting asset", error);
        reject(error);
      } else {
        console.log("Response gtting asset: ", JSON.stringify(body));
        resolve(body);
      }
    });
      
  })
}
  
const newNodeAddr = (clientStr, genesis_bootstrap_info, group_key, amount) => {
  let options = HTTP_OPTIONS[clientStr];
  options.url += 'addrs';
  let requestBody = {
    genesis_bootstrap_info: genesis_bootstrap_info, // <bytes> (base64 encoded)
    //group_key: Buffer.from(group_key), //.toString("base64"), //group_key, // <bytes> (base64 encoded)
    amt: amount, // <int64> 
  };
  options.form = JSON.stringify(requestBody);
  console.log("Options: " + JSON.stringify(options));
  return new Promise((resolve, reject) => {  
    request.post(options, function(error, response, body) {
      if (error) {
        console.log("Error generating address", error);
        reject(error);
      } else {
        console.log("Response generating address: ", JSON.stringify(body));
        resolve(body);
      }
    });  
  })
}

const sendAssets = (clientStr, asset_address) => {
  let options = HTTP_OPTIONS[clientStr];
  options.url += 'send';
  let requestBody = {
    taro_addr: asset_address, // <string> 
  };
  options.form = JSON.stringify(requestBody);
  console.log("Options: " + JSON.stringify(options));
  return new Promise((resolve, reject) => {
    request.post(options, function(error, response, body) {
      if (error) {
        console.log("Error sending asset", error);
        reject(error);
      } else {
        console.log("Response sending asset: ", JSON.stringify(body));
        resolve(body);
      }
    });      
  })
}

const exportProof = (clientStr, asset_id, script_key) => {
  let options = HTTP_OPTIONS[clientStr];
  options.url += 'proofs/export';
  let requestBody = {
    asset_id: asset_id, // <bytes> (base64 encoded)
    script_key: script_key, // <bytes> (base64 encoded)
  };
  options.form = JSON.stringify(requestBody);
  console.log("Options: " + JSON.stringify(options));
  return new Promise((resolve, reject) => {
    request.post(options, function(error, response, body) {
      if (error) {
        console.log("Error exporting proof", error);
        reject(error);
      } else {
        console.log("Response exporting proof: ", JSON.stringify(body));
        resolve(body);
      }
    });      
  })
}

const importProof = (clientStr, asset_id, script_key) => {
  let options = HTTP_OPTIONS[clientStr];
  options.url += 'proofs/import';
  let proof_file_path =  config['PROOF_FILE'] + '/' + asset_id + "/"+ script_key +".taro";
  let requestBody ={
    proof_file : proof_file_path //: <string>, // <string> 
  };
  options.form = JSON.stringify(requestBody);
  console.log("Options: " + JSON.stringify(options));
  return new Promise((resolve, reject) => {
    request.post(options, function(error, response, body) {
      if (error) {
        console.log("Error importing proof", error);
        reject(error);
      } else {
        console.log("Response importing proof: ", JSON.stringify(body));
        resolve(body);
      }
    });      
  })
}

const verifyProof = (clientStr, raw_proof, genesis_point) => {
  let options = HTTP_OPTIONS[clientStr];
  options.url += 'proofs/verify';
  let requestBody = {
    ...raw_proof, //: <string>, // <bytes> (base64 encoded)
    ...genesis_point, //: <string>, // <string> 
  };
  options.form = JSON.stringify(requestBody);
  console.log("Options: " + JSON.stringify(options));
  return new Promise((resolve, reject) => {
    request.post(options, function(error, response, body) {
      if (error) {
        console.log("Error verifying proof", error);
        reject(error);
      } else {
        console.log("Response verifying proof: ", JSON.stringify(body));
        resolve(body);
      }
    });      
  })
}

// mintAsset("alice",  "neha4", {"a":"dss"}, 1)
//     .then(text => {
      getAssetList("alice").then((body) => {
        let asset = body?.assets[1];
        console.log("Response11: ", JSON.stringify(asset));
        let genesis_bootstrap_info = asset?.asset_genesis?.genesis_bootstrap_info;
        newNodeAddr("bob", genesis_bootstrap_info, '1', '1').then((body1) => {
          console.log("Address generated: ", JSON.stringify(body1));
          sendAssets("alice", body1?.encoded).then((body2) => {
            console.log("Response sending address: ", JSON.stringify(body2));
            exportProof("alice", body2?.asset_id, body2?.script_key).then((body3) => {
              console.log("Response exporting asset: ", JSON.stringify(body3));
              importProof("bob",body2?.asset_id, body2?.script_key).then((body4) => {
                console.log("Response importing asset: ", JSON.stringify(body4));
              }).catch((error4) => {
                console.log("Error importing asset", error4);
              })
            }).catch((error3) => {
              console.log("Error exporting asset", error3);
            });
          }).catch((error2) => {
            console.log("Error sending address:", error2);
          })

        }).catch((error) => {
          console.log("Error generating address: ", error);
        }); 
      }).catch(err => {
        console.log(err);
    });

    // })
    // .catch(err => {
    //   console.log(err);
    // });

