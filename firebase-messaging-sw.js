/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/3.5.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.5.0/firebase-messaging.js');

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../firebase-messaging-sw.js')
        .then(function (registration) {
            console.log('Registration successful, scope is:', registration.scope);
        }).catch(function (err) {
            console.log('Service worker registration failed, error:', err);
        });
}
firebase.initializeApp({
    apiKey: "AIzaSyASJzNLXUPo_rzXp-N_IAtkpFOObCyEtzk",
    authDomain: "synk-server.firebaseapp.com",
    databaseURL: "https://synk-server.firebaseio.com",
    projectId: "synk-server",
    storageBucket: "synk-server.appspot.com",
    messagingSenderId: "271189013400",
    appId: "1:271189013400:web:ccadc7585d63cd088a31ed",
    measurementId: "G-CJJGQ7XCRH"
})

const initMessaging = firebase.messaging()