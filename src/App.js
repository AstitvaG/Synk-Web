import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import firebase from './firebase'

import Auth from './components/auth.component'
import Main from './components/main.component'


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

// export default App;

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }
  componentDidMount() {
    const messaging = firebase.messaging()
    messaging.requestPermission().then(() => {
      return messaging.getToken()
    }).then(token => {
      console.log('Token : ', token)
    }).catch((err) => {
      console.log(err);

    })
    // messaging.onMessage((payload)=>{
    //   console.log(payload);

    // })
  }
  render() {
    return (
      <Router>
        {localStorage.setItem('userOs', getOS())}
        <div className="container-fluid">
          <Route path="/auth" component={Auth} />
          <Route path="/" exact component={Main} />
          <Route path="/home" component={Main} />
        </div>
      </Router>
    )
  }
}
