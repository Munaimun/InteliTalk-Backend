import dotenv from "dotenv";
import http from "http";
import https from "https";
dotenv.config();

const URL_TO_CALL = process.env.URL || "http://localhost:5001/";
const INTERVAL_MINUTES = 14;
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;

// Function to call the URL
function callURL() {
  const client = URL_TO_CALL.startsWith("https") ? https : http;

  const req = client.get(URL_TO_CALL, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      console.log(
        `[${new Date().toISOString()}] Called ${URL_TO_CALL} → ${
          res.statusCode
        }`
      );
    });
  });

  req.on("error", (err) => {
    console.error(
      `[${new Date().toISOString()}] Error calling ${URL_TO_CALL}: ${
        err.message
      }`
    );
  });

  req.end();
}

// Run immediately once
callURL();

// Then run every 14 minutes
setInterval(callURL, INTERVAL_MS);
