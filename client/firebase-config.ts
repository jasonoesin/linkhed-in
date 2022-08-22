// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATkTkTOi0eqYhAvQkBFxNpLRgN6AwW-9E",
  authDomain: "linkhed-in.firebaseapp.com",
  projectId: "linkhed-in",
  storageBucket: "linkhed-in.appspot.com",
  messagingSenderId: "264912630879",
  appId: "1:264912630879:web:1cc42944d7a4779dd217ea",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
export default storage;
