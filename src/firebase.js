import firebase from 'firebase/app'
import 'firebase/messaging'

const config ={
    apiKey: "AIzaSyASJzNLXUPo_rzXp-N_IAtkpFOObCyEtzk",
    authDomain: "synk-server.firebaseapp.com",
    databaseURL: "https://synk-server.firebaseio.com",
    projectId: "synk-server",
    storageBucket: "synk-server.appspot.com",
    messagingSenderId: "271189013400",
    appId: "1:271189013400:web:ccadc7585d63cd088a31ed",
    measurementId: "G-CJJGQ7XCRH"
}
firebase.initializeApp(config)

export default firebase