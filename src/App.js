import React, { Component } from 'react';
import { BrowserRouter as Router} from "react-router-dom";
import axios from 'axios';

import Enter from './components/enter.component'
import Main from './components/main.component'
import PrivateRoute from './utils/privateRoute';
import PublicRoute from './utils/publicRoute';
import { getToken, removeUserSession, setUserSession } from './utils/common';


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

function isMobile() {
	if (['Android', 'iOS'].indexOf(getOS()) !== -1) return true;
	else return false;
}
// export default App;

export default class App extends Component {

	constructor(props) {
		super(props)
		this.state = {
			loading: true
		}
	}

	componentDidMount = () => {
		if (isMobile()) {this.setState({loading: false});return}
		const token = getToken();
		if (!token) {
			return;
		}

		axios.get(`https://web.synk.tools/auth/verifyToken?token=${token}`).then(response => {
			setUserSession(response.data.token, response.data.user);
			this.setState({ loading: false });
		}).catch(error => {
			removeUserSession();
			this.setState({ loading: false });
		});

	}

	render() {
		if (this.state.loading && getToken()) {
			return <div className="content">Checking Authentication...</div>
		}
		return (
			<Router>
				{localStorage.setItem('userOs', getOS())}
				{ isMobile()
					? <div>Download the app to continue</div>
					: <div className="container-fluid">
						<PublicRoute path="/enter" component={Enter} />
						<PrivateRoute path="/" exact component={Main} />
					</div>
				}
			</Router>
		)
	}
}