const express = require("express");
const bodyParser = require("body-parser");
var cors = require('cors')

const taro = require("./taro_utils");

const app = express();
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json())
app.use(express.static("public"));

// mint assets
app.post("/mint-assets", (req, res) => {
  console.log(req.body);
  let reqObj = {
    host: req.body.host || "localhost:8089",
    macaroon: req.body.macaroon || "",
    name: req.body.asset_name || "",
    metadata: req.body.asset_metadata || "",
    amount: req.body.asset_amount || 1000,
  };
  taro
    .mintAsset(
      reqObj.host,
      reqObj.macaroon,
      reqObj.name,
      reqObj.metadata,
      reqObj.amount
    )
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// Connecting gfg-employees database to our express application

// Fetching all the employees
app.get("/list-assets", (req, res) => {
	console.log(req.query);
  let reqObj = {
    host: req.query.host || "localhost:8089",
    macaroon: req.query.macaroon || "",
  };
  taro
    .getAssetList(reqObj.host, reqObj.macaroon)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.get("/balance-assets", (req, res) => {
  let reqObj = {
    host: req.query.host || "localhost:8089",
    macaroon: req.query.macaroon || "",
  };
  taro
    .getAssetBalance(reqObj.host, reqObj.macaroon)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.post("/new-address", (req, res) => {
  let reqObj = {
    host: req.body.host || "localhost:8089",
    macaroon: req.body.macaroon || "",
    genesis_bootstrap_info: req.body.genesis_bootstrap_info || "",
    amount: req.body.asset_amount || 1,
  };
  taro
    .newNodeAddr(
      reqObj.host,
      reqObj.macaroon,
      reqObj.genesis_bootstrap_info,
      reqObj.amount
    )
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.post("/send-assets", (req, res) => {
  let reqObj = {
    host: req.body.host || "localhost:8089",
    macaroon: req.body.macaroon || "",
    asset_address: req.body.asset_address || "",
  };
  taro
    .sendAssets(reqObj.host, reqObj.macaroon, reqObj.asset_address)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.post("/export-asset-proof", (req, res) => {
  let reqObj = {
    host: req.body.host || "localhost:8089",
    macaroon: req.body.macaroon || "",
    asset_id: req.body.asset_id || "",
    script_key: req.body.script_key || "",
  };
  taro
    .exportProof(
      reqObj.host,
      reqObj.macaroon,
      reqObj.asset_id,
      reqObj.script_key
    )
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.post("/import-asset-proof", (req, res) => {
  let reqObj = {
    host: req.body.host || "localhost:8089",
    macaroon: req.body.macaroon || "",
    raw_proof: req.body.raw_proof || "",
  };
  taro
    .importProof(reqObj.host, reqObj.macaroon, reqObj.raw_proof)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.post("/verify-asset-proof", (req, res) => {
  let reqObj = {
    host: req.body.host || "localhost:8089",
    macaroon: req.body.macaroon || "",
    raw_proof: req.body.raw_proof || "",
    genesis_point: req.body.genesis_point || "",
  };
  taro
    .verifyProof(
      reqObj.host,
      reqObj.macaroon,
      reqObj.raw_proof,
      reqObj.genesis_point
    )
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// Posting a new employee

app.listen(3005, function () {
  console.log("Server started on port 3005");
});
