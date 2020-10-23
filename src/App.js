import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import Upload from './components/upload.component'
import Auth from  './components/auth.component'
import Main from  './components/main.component'
import ListState from  './components/list.component'



// function req(vax) {
//   var loginstats = localStorage.getItem('isLoggedIn');
//   var typestats = localStorage.getItem('type');
//   if (loginstats === "true" && typestats === 'Vendor') {
//     return Main;
//   }
//   else if (loginstats === "true" && typestats === 'Customer')
//   {
//     return Upload;
//   }
//   else return LoginSignup;
// }

function getOS() {
  var userAgent = window.navigator.userAgent,
      platform = window.navigator.platform,
      macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
      windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
      iosPlatforms = ['iPhone', 'iPad', 'iPod'],
      os = null;
  if (macosPlatforms.indexOf(platform) !== -1) {
      os = 'Mac OS';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
      os = 'iOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
      os = 'Windows';
  } else if (/Android/.test(userAgent)) {
      os = 'Android';
  } else if (!os && /Linux/.test(platform)) {
      os = 'Linux';
  }
  return os;
}

// function checklogin(vax)
// {
//   var loginstats = localStorage.getItem('isLoggedIn');
//   var typestats = localStorage.getItem('type');
//   console.log("LOL:",typestats, loginstats);
//   if (loginstats === "true" && typestats === 'Vendor'){
//     console.log("LOL inside:",typestats, loginstats);
//     return vax;}
//   else return LoginSignup;
// }

function App() {
  return (
    <Router>
      {localStorage.setItem('userOs',getOS())}
      <div className="container-fluid">
        <Route path="/auth" component={Auth}/>
        <Route path="/" exact component={Upload}/>
        <Route path="/home" component={Main}/>
        <Route path="/list" component={ListState}/>
      </div>
    </Router>
  );
}

export default App;
