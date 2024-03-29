import React, { Component } from 'react';
import QRCode from 'qrcode.react';

import axios from 'axios';
import './enter.css';
import { baseUrl, setUserSession } from '../utils/common';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import ClipLoader from "react-spinners/ClipLoader";
import socketIOClient from "socket.io-client";
const socket = socketIOClient('http://localhost:7000/');
socket.request = function request(type, data = {}) {
    return new Promise((resolve, reject) => {
        socket.emit(type, data, (data) => {
            if (data.error) {
                reject(data.error)
            } else {
                resolve(data)
            }
        })
    })
}
/* eslint-disable jsx-a11y/anchor-is-valid */

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
            authCode: ''
        }
    }

    authCodeInterval = null;

    componentDidMount = async () => {
        let authCode = await socket.request('newAuthQR')
        this.setState({ authCode });
        console.log(authCode)
        this.authCodeInterval = setInterval(async () => {
            let authCode = await socket.request('newAuthQR')
            this.setState({ authCode });
            console.log(authCode)
        }, 20000)
        socket.on('verifiedAuth', (data) => {
            toast.dark('✌️ Logged in Successfully!');
            clearInterval(this.authCodeInterval);
            socket.disconnect();
            setUserSession(data.token, data.user)
            this.props.history.push('/')
        })
    };

    componentWillUnmount = () => {
        clearInterval(this.authCodeInterval);
        socket.disconnect();
    }


    onChangeUsername = (event, check = true) => {
        this.setState({ username: event.target.value });
        const username = event.target.value;
        let truth = username.length > 3
        this.setState({
            nameError: truth ? null : 'Name must be longer than 3 characters'
        })
        check && truth && axios.get(`${baseUrl}/auth/check/name/` + username)
            .catch(() => this.setState({
                nameError: 'Username taken!'
            }))
    }


    onChangeEmail = (event, check = true) => {
        this.setState({ email: event.target.value });
        const email = event.target.value;
        let truth = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)
        this.setState({
            emailError: truth ? null : 'Email must be of valid type'
        })
        check && truth && axios.get(`${baseUrl}/auth/check/email/` + email)
            .catch(() => this.setState({
                emailError: 'Email taken!'
            }))
    }


    onChangePassword = (event) => {
        this.setState({ password: event.target.value });
        const password = event.target.value;
        this.setState({
            passError: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(password)
                ? null : 'Minimum eight characters are required, at least one letter and one number'
        });
    }

    onSignup = (e) => {
        e.preventDefault();
        var { emailError, nameError, passError } = this.state
        if (emailError || nameError || passError) {
            toast.dark('🔧 Details have errors, check again!');
            return;
        }
        this.setState({ loading: true })
        const newUser = {
            username: this.state.username,
            email: this.state.email,
            password: this.state.password,
        }
        axios.post(`${baseUrl}/auth/signup`, newUser)
            .then(res => {
                this.setState({ loading: false })
                toast.dark('✌️ Signed up Successfully!');
                setUserSession(res.data.token, res.data.user)
                this.props.history.push('/')
            })
            .catch(err => {
                toast.dark('⚡ Some error occured!')
                this.setState({ loading: false })
            })
    }

    onLogin = (e) => {
        e.preventDefault();
        this.setState({ loading: true })
        var loginDetails = {
            username: this.state.email,
            password: this.state.password
        }
        axios.post(`${baseUrl}/auth/login`, loginDetails)
            .then(res => {
                this.setState({ loading: false })
                toast.dark('✌️ Logged in Successfully!');
                setUserSession(res.data.token, res.data.user)
                this.props.history.push('/')
            })
            .catch(err => {
                this.setState({ loading: false })
                toast.dark('🔑 Invalid credentials!');
            })
    }

    onToggle = (e, val = 0) => {
        let parent = e.target.parentNode;
        if (val === 0) parent = parent.parentNode;
        const btn = document.getElementById(val === 1 ? 'login' : 'signup');
        Array.from(parent.classList).find((element) => {
            if (element !== "slide-up") {
                parent.classList.add('slide-up')
            } else {
                if (val === 0) btn.parentNode.classList.add('slide-up')
                else btn.parentNode.parentNode.classList.add('slide-up')
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
                        <h2 className="form-title" id="signup" onClick={(e) => this.onToggle(e, 1)}><span>or</span>Sign up</h2>
                        <form onSubmit={this.onSignup}>
                            <div className="form-holder">
                                <input type="username" required placeholder="Name"
                                    className="input"
                                    value={this.state.username}
                                    onChange={this.onChangeUsername}
                                    onBlur={this.validateName} />
                                <a data-tip={this.state.nameError}>
                                    {
                                        this.state.nameError
                                            ? this.state.username ? <i className="las la-exclamation" style={{ color: "grey", position: "absolute", right: 15, marginTop: 10 }}></i> : ""
                                            : <i className="las la-check" style={{ color: "green", position: "absolute", right: 15, marginTop: 10 }}></i>
                                    }
                                </a>
                                <input type="email" required placeholder="Email"
                                    className="input"
                                    value={this.state.email}
                                    onChange={this.onChangeEmail}
                                    onBlur={this.validateEmail} />
                                <a data-tip={this.state.emailError}>
                                    {
                                        this.state.emailError
                                            ? this.state.email ? <i className="las la-exclamation" style={{ color: "grey", position: "absolute", right: 15, marginTop: 10 }}></i> : ""
                                            : <i className="las la-check" style={{ color: "green", position: "absolute", right: 15, marginTop: 10 }}></i>
                                    }
                                </a>
                                <input type="password" required placeholder="Password"
                                    className="input lastchild"
                                    value={this.state.password}
                                    onChange={this.onChangePassword}
                                    onBlur={this.validatePass} />
                                <a data-tip={this.state.passError}>
                                    {
                                        this.state.passError
                                            ? this.state.password ? <i className="las la-exclamation" style={{ color: "grey", position: "absolute", right: 15, marginTop: 10 }}></i> : ""
                                            : <i className="las la-check" style={{ color: "green", position: "absolute", right: 15, marginTop: 10 }}></i>
                                    }
                                </a>
                            </div>
                            <button className="submit-btn">
                                {!this.state.loading
                                    ? "Sign up"
                                    : <ClipLoader size={15} color="white" />
                                }
                            </button>
                        </form>
                    </div>
                    <div className="login slide-up">
                        <div className="center">
                            <h2 className="form-title" id="login" onClick={this.onToggle}><span>or</span>Log in</h2>
                            <form onSubmit={this.onLogin}>
                                <div className="form-holder">
                                    <input type="username" required placeholder="Name or Email"
                                        className="input"
                                        value={this.state.email}
                                        onChange={(e) => this.onChangeEmail(e, false)} />
                                    <input type="password" required placeholder="Password"
                                        className="input"
                                        value={this.state.password}
                                        onChange={(e) => this.onChangePassword(e, false)} />
                                </div>
                                <button className="submit-btn">
                                    {!this.state.loading
                                        ? "Log in"
                                        : <ClipLoader size={15} color="white" />
                                    }
                                </button>
                                <div className='title-tag'>or</div>
                                <div className='scanCode'>
                                    <div>
                                        <div style={{ color: '#888' }}>Scan this</div>
                                        <div style={{ color: '#888' }}>code from</div>
                                        <div style={{ color: '#6692a3', fontWeight: 'bold' }}>Synk Mobile App</div>
                                    </div>
                                    <br />
                                    {this.state.authCode !== "" && <QRCode value={this.state.authCode} bgColor="#d9f1fa" fgColor="#152b33" />}
                                </div>
                            </form>
                        </div>
                    </div>
                    <ReactTooltip place="bottom" type="dark" effect="solid" />
                </div>
            </div>
        )
    }
}