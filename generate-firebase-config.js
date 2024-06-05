// generate-firebase-config.js
const fs = require('fs');
const path = require('path');

const firebaseConfig = `
import { initializeApp } from "firebase/app";

const config = {
  apiKey: "${process.env.REACT_APP_API_KEY}",
  authDomain: "${process.env.REACT_APP_AUTH_DOMAIN}",
  projectId: "${process.env.REACT_APP_PROJECT_ID}",
  storageBucket: "${process.env.REACT_APP_STORAGE_BUCKET}",
  messagingSenderId: "${process.env.REACT_APP_MESSAGING_SENDER_ID}",
  appId: "${process.env.REACT_APP_APP_ID}"
};

const firebaseApp = initializeApp(config);
export default firebaseApp;
`;

const filePath = path.join(__dirname, 'src', 'configuration', 'firebase-config.js');
fs.writeFileSync(filePath, firebaseConfig);
