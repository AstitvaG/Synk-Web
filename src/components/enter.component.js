import React, { Component } from 'react';
import axios from 'axios';
import './enter.component.css';
import { setUserSession } from '../utils/common';
// import ls from 'local-storage'


export default class Enter extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            username: '',
            email: '',
            password: '',
            nameError: 'Name must be longer than 3 characters',
            emailError: 'Email must be of valid type',
            passError: 'Minimum eight characters are required, at least one letter and one number',
            userOs: localStorage.getItem('userOs'),
        }

        this.onGoToLogin = this.onGoToLogin.bind(this);
        this.onGoToSignup = this.onGoToSignup.bind(this);
    }

    onChangeUsername = event => {
        this.setState({ username: event.target.value }, () => { this.validateUsername(); });
    }


    onChangeEmail = event => {
        this.setState({ email: event.target.value }, () => { this.validateEmail(); });
    }


    onChangePassword = event => {
        this.setState({ password: event.target.value }, () => { this.validatePass(); });
    }

    validateUsername = () => {
        const { username } = this.state;
        this.setState({
            nameError: username.length > 3 ? null : 'Name must be longer than 3 characters'
        });
    }

    validateEmail = () => {
        const { email } = this.state;
        this.setState({
            emailError: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)
                // emailError: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email) 
                ? null : 'Email must be of valid type'
        });
    }

    validatePass = () => {
        const { password } = this.state;
        this.setState({
            passError: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)
                ? null : 'Minimum eight characters are required, at least one letter and one number'
        });
    }

    onSignup = (e) => {
        e.preventDefault();
        var { emailError, nameError, passError } = this.state
        if (emailError || nameError || passError) return;
        const newUser = {
            username: this.state.username,
            email: this.state.email,
            password: this.state.password,
        }
        this.setState({ loading: true })
        axios.post('https://web.synk.tools/auth/signup', newUser)
            .then(res => {
                console.log("Signup")
                this.setState({ loading: false })
                setUserSession(res.data.token, res.data.user)
                this.props.history.push('/')
            })
            .catch(err => {
                this.setState({ loading: false })
                console.log(err)
            })
    }

    onLogin = (e) => {
        e.preventDefault();
        var loginDetails = {
            username: this.state.email,
            password: this.state.password
        }
        this.setState({ loading: true })
        axios.post('https://web.synk.tools/auth/login', loginDetails)
            .then(res => {
                this.setState({ loading: false })
                setUserSession(res.data.token, res.data.user)
                this.props.history.push('/')
            })
            .catch(err => {
                this.setState({ loading: false })
                console.log(err)
            })
    }

    onGoToLogin = (e) => {
        let parent = e.target.parentNode.parentNode;
        const signupBtn = document.getElementById('signup');
        Array.from(e.target.parentNode.parentNode.classList).find((element) => {
            if (element !== "slide-up") {
                parent.classList.add('slide-up')
            } else {
                signupBtn.parentNode.classList.add('slide-up')
                parent.classList.remove('slide-up')
            }
            return null
        });
    }


    onGoToSignup = (e) => {
        let parent = e.target.parentNode;
        const loginBtn = document.getElementById('login');
        Array.from(e.target.parentNode.classList).find((element) => {
            if (element !== "slide-up") {
                parent.classList.add('slide-up')
            } else {
                loginBtn.parentNode.parentNode.classList.add('slide-up')
                parent.classList.remove('slide-up')
            }
            return null
        });
    }

    render() {
        return (
            <div className="context-user">
                <div className="form-structor">
                    <div className="signup">
                        <h2 className="form-title" id="signup" onClick={this.onGoToSignup}><span>or</span>Sign up</h2>
                        <form onSubmit={this.onSignup}>
                            <div className="form-holder">
                                <input type="username" required placeholder="Name"
                                    className="input"
                                    value={this.state.username}
                                    onChange={this.onChangeUsername}
                                    onBlur={this.validateName} />
                                {
                                    this.state.nameError
                                        ? this.state.username ? <i className="fas fa-exclamation" style={{ color: "grey", position: "absolute", right: 15, marginTop: 10 }}></i> : ""
                                        : <i className="fas fa-check" style={{ color: "green", position: "absolute", right: 15, marginTop: 10 }}></i>
                                }
                                <input type="email" required placeholder="Email"
                                    className="input"
                                    value={this.state.email}
                                    onChange={this.onChangeEmail}
                                    onBlur={this.validateEmail} />
                                {
                                    this.state.emailError
                                        ? this.state.email ? <i className="fas fa-exclamation" style={{ color: "grey", position: "absolute", right: 15, marginTop: 10 }}></i> : ""
                                        : <i className="fas fa-check" style={{ color: "green", position: "absolute", right: 15, marginTop: 10 }}></i>
                                }
                                <input type="password" required placeholder="Password"
                                    className="input"
                                    value={this.state.password}
                                    onChange={this.onChangePassword}
                                    onBlur={this.validatePass} />
                                {
                                    this.state.passError
                                        ? this.state.password ? <i className="fas fa-exclamation" style={{ color: "grey", position: "absolute", right: 15, marginTop: 10 }}></i> : ""
                                        : <i className="fas fa-check" style={{ color: "green", position: "absolute", right: 15, marginTop: 10 }}></i>
                                }
                            </div>
                            <button onClick={this.onSignup} className="submit-btn">Sign up</button>
                        </form>
                    </div>
                    <div className="login slide-up">
                        <div className="center">
                            <h2 className="form-title" id="login" onClick={this.onGoToLogin}><span>or</span>Log in</h2>
                            <form onSubmit={this.onLogin}>
                                <div className="form-holder">
                                    <input type="username" required placeholder="Name or Email"
                                        className="input"
                                        value={this.state.email}
                                        onChange={this.onChangeEmail} />
                                    <input type="password" required placeholder="Password"
                                        className="input"
                                        value={this.state.password}
                                        onChange={this.onChangePassword} />
                                </div>
                                <button onClick={this.onLogin} className="submit-btn">Log in</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}