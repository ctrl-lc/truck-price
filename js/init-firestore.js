// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCfCLScPkTjAUmRihLP-IDtOh0nksRlxVc",
    authDomain: "best-trucks.firebaseapp.com",
    databaseURL: "https://best-trucks.firebaseio.com",
    projectId: "best-trucks",
    storageBucket: "best-trucks.appspot.com",
    messagingSenderId: "560287018063",
    appId: "1:560287018063:web:b6fa09faa77488f8514e3a",
    measurementId: "G-VNG1FYCBRJ"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var db = firebase.firestore();