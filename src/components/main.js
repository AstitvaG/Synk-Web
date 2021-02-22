/* eslint-disable */
import React, { Component } from 'react';
import axios from 'axios';
import './main.css';
import $ from 'jquery';
import moment from 'moment';
import { getUser, removeUserSession, parseDate, renderFileIcon, fileType, getFileType, baseUrl } from '../utils/common';
import ClipLoader from "react-spinners/ClipLoader";
import firebase from '../firebase'
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { detect } from 'detect-browser';
import SimpleBar from 'simplebar-react';
import SettingsModal from './settings';
import 'simplebar/dist/simplebar.min.css';
import ReactTooltip from 'react-tooltip';
import { toast } from 'react-toastify';
import Quick, { FilePreview } from './quick';

export default class Main extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 1,
            tabType: '',
            showLeft: false,
            showRight: false,
            fileList: [],
            sentGrouped: [],
            recGrouped: [],
            drag: 0,
            user: getUser(),
            recieverName: '',
            selectedFiles: [],
            caption: '',
            closeIcon: -1,
            uploadArray: [],
            countDone: 0,
            recentTexts: null,
            deviceList: [],
            deviceLoading: true,
            deviceSected: '',
            myToken: '',
            settingsModal: false,
        }
        this.inputRef = React.createRef();
    }

    handleCase = (str) => {
        return str[0].toUpperCase() + str.substring(1).toLowerCase();
    }

    componentDidMount() {
        this.registerPushMessaging()
        $('.main-area').scroll(function () {
            if ($('.main-area').scrollTop() >= 88) {
                $('div.main-area-header').addClass('fixed');
            }
            else {
                $('div.main-area-header').removeClass('fixed');
            }
        });
        axios.get(`${baseUrl}/file/recent/25`, { params: { username: this.state.user.username } })
            .then(response => {
                this.setState({ fileList: response.data.files });
                this.groupFiles(response.data.files)
            })
            .catch(err => console.log(err));
        this.getRecentTexts();
        var url = new URL(window.location.href);
        var tab = (url.searchParams.get("tab") || "").toLowerCase();
        if (tab != null && ['images', 'music', 'videos', 'docs', 'apps', 'compressed', 'texts'].includes(tab))
            this.setState({ activeTab: 2, tabType: this.handleCase(tab) })
    }

    registerPushMessaging = async () => {
        const messaging = firebase.messaging()
        let unique = await FingerprintJS.load().then((res) => res.get()).then((res => res.visitorId));
        let bd = await detect()
        await Notification.requestPermission().then(() => {
            return messaging.getToken()
        }).then(token => {
            this.setState({ myToken: token })
            axios.post(`${baseUrl}/device/add`, {
                username: this.state.user.username,
                token: token,
                deviceName: this.handleCase(bd.name) + " on " + this.handleCase(bd.os),
                platform: 2,
                unique: unique,
            })
                .then(res => {
                    this.getDeviceList()
                })
                .catch(err => console.log(err));
        }).catch((err) => {
            console.log(err);
        })
    }

    getDeviceList = () => {
        axios.post(`${baseUrl}/device/`, { username: this.state.user.username })
            .then(res => {
                let devList = res.data.devices.filter((data) => data.token !== this.state.myToken)
                this.setState({ deviceList: devList, deviceLoading: false, deviceSected: devList[0] });
            })
            .catch(err => console.log(err));
    }

    getRecentTexts = () => {
        this.setState({ recentTexts: null });
        axios.get(`${baseUrl}/text/recent/100/?username=${this.state.user.username}`)
            .then(res => {
                console.log(res.data?.texts ?? [])
                this.setState({ recentTexts: res.data?.texts ?? [] })
            })
            .catch(err => {
                toast.dark("⚠️ Error occured while recieving texts!")
            });
    }

    groupFiles = (arr) => {
        var sent = arr.filter((val) => val.senderName === 'Website')
        var done = new Array(), ret = new Array(), tem = new Array()
        for (var item in sent) {
            if (!done.includes(moment(sent[item].createdAt).format("dd MMM yyyy"))) {
                if (tem.length > 0) ret.push(tem)
                tem = new Array()
                done.push(moment(sent[item].createdAt).format("dd MMM yyyy"))
            }
            tem.push(sent[item])
        }
        if (tem.length > 0) ret.push(tem)
        this.setState({ sentGrouped: ret })
        var rec = arr.filter((val) => val.senderName !== 'Website')
        done = new Array(), ret = new Array(), tem = new Array()
        for (var item in rec) {
            if (!done.includes(moment(rec[item].createdAt).format("dd MMM yyyy"))) {
                if (tem.length > 0) ret.push(tem)
                tem = new Array()
                done.push(moment(rec[item].createdAt).format("dd MMM yyyy"))
            }
            tem.push(rec[item])
        }
        if (tem.length > 0) ret.push(tem)
        this.setState({ recGrouped: ret })
    }

    filter = (type) => {
        this.props.history.push("/?tab=" + type.toLowerCase())
        this.setState({ activeTab: 2, tabType: type })
    }


    renderUploadCard = (item, idx) => {
        return (
            <div className="download-area" key={idx}>
                <div className="download-item-icon">
                    {renderFileIcon((item.name || item.originalName).split('.').pop().toLowerCase())}
                </div>
                <div className="download-item-texts">
                    <p className="download-text-header">{item.originalName || item.name}</p>
                    <p className="download-text-info">{item.caption}<span>{moment(item.createdAt).format("h:mm A")}</span></p>
                    <p className="download-text-info">To {item.recieverName}<span><i className="lab la-android"></i></span></p>
                    <div className="progressy-bar">
                        <span className="progressy" style={{ width: `${this.state.uploadArray[idx].done}%` }}></span>
                    </div>
                </div>
                <div className="download-icon">
                    <ClipLoader size={26} color="blue" />
                </div>
            </div>
        )
    }

    renderDownloadCard = (item, i, j) => {
        return (
            <div className="download-area" key={"file-" + i + "-" + j} onDoubleClick={() => window.open(`${baseUrl}/file/render/${item.filename}`, "_blank")}>
                <div className="download-item-icon">
                    {renderFileIcon(fileType(item.name || item.originalName))}
                </div>
                <div className="download-item-texts">
                    <p className="download-text-header">{item.originalName || item.name}</p>
                    <p className="download-text-info">{item.caption}<span>{moment(item.createdAt).format("h:mm A")}</span></p>
                    <p className="download-text-info">To {item.recieverName}<span><i className="lab la-android"></i></span></p>
                </div>
                <a href={`${baseUrl}/file/download/${item.filename}`} download={item.originalName}>
                    <div className="download-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 612">
                            <defs />
                            <path d="M403.939 295.749l-78.814 78.833V172.125c0-10.557-8.568-19.125-19.125-19.125s-19.125 8.568-19.125 19.125v202.457l-78.814-78.814c-7.478-7.478-19.584-7.478-27.043 0-7.478 7.478-7.478 19.584 0 27.042L289.208 431c4.59 4.59 10.863 6.005 16.812 4.953 5.929 1.052 12.221-.382 16.811-4.953l108.19-108.19c7.478-7.478 7.478-19.583 0-27.042-7.498-7.478-19.604-7.478-27.082-.019zM306 0C137.012 0 0 136.992 0 306s137.012 306 306 306 306-137.012 306-306S475.008 0 306 0zm0 573.75C158.125 573.75 38.25 453.875 38.25 306S158.125 38.25 306 38.25 573.75 158.125 573.75 306 453.875 573.75 306 573.75z" />
                        </svg>
                    </div>
                </a>
            </div>
        )
    }


    renderDrop = () => {
        if (this.state.drag <= 0 && this.state.selectedFiles.length <= 0)
            return null
        return (
            <div className="drop-container content-section" style={{
                display: 'flex',
                justifyContent: 'flex-start'
            }}
            >
                {this.state.drag > 0 && <div className="drop-message">Drop files here</div>}
                {this.state.selectedFiles.length > 0 && <p className="upload-message">Files Selected</p>}
                {this.state.selectedFiles.length > 0 && <p className="upload-message" style={{ fontSize: "20px", marginTop: "-10px" }}>{this.state.selectedFiles.length} file{this.state.selectedFiles.length === 1 ? "" : 's'} selected</p>}
                {this.state.selectedFiles.length > 0 && <div style={{ flexDirection: 'row', marginBottom: "30px" }}>
                    <button style={{ height: "40px", width: "100px", borderRadius: "10px", border: 'none', backgroundColor: '#ffdbcc', marginLeft: '10px', marginRight: '10px', color: '#755550' }} onClick={() => this.setState({ selectedFiles: [] })}>Remove All</button>
                    <button style={{ height: "40px", width: "100px", borderRadius: "10px", border: 'none', backgroundColor: '#3275f7', marginLeft: '10px', marginRight: '10px', color: '#FFFFFF' }} onClick={() => this.inputRef.current.click()}>Add More</button>
                </div>}
                {/* <div className="file-display-container"> */}
                <SimpleBar className="file-display-container">

                    {
                        this.state.selectedFiles.map((data, i) =>
                            <div key={i} className="file-selected unselectable" style={{ cursor: "pointer", background: "white" }}
                                onMouseEnter={() => this.setState({ closeIcon: i })}
                                onMouseLeave={() => this.setState({ closeIcon: -1 })}
                                onClick={() => this.removeFile(data.name)}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex justify-content-between align-items-center">
                                        {this.state.closeIcon != i
                                            ? renderFileIcon(fileType(data.name), 50)
                                            : renderFileIcon("close-icon", 50)
                                        }
                                        <div className="mb-3 mb-sm-0 ml-3">
                                            <p className="font-weight-bold mb-0 text-truncate"
                                                style={{ maxWidth: "240px" }}>{data.name}</p>
                                            <small className="text-secondary text-truncate">{fileType(data.name).toUpperCase() || "Executable"} file</small>
                                        </div>
                                    </div>
                                </div>
                                <p className="float-right"><font size="+2">{this.fileSize(data.size).split(' ')[0]} </font>{this.fileSize(data.size).split(' ')[1]}</p>
                            </div>
                        )
                    }
                </SimpleBar>
                {/* </div> */}
                {this.state.selectedFiles.length >= 0 && <div className="section-header-wrapper mt-3">
                    <h1 className="section-header">Select Device</h1>
                    {this.state.deviceList.length > 6 && <a className="section-header-link">
                        View All
                    </a>}
                </div>}
                {this.state.selectedFiles.length >= 0 && <div className="device-display-container" style={{ justifyContent: 'center' }}>
                    {
                        !this.state.deviceLoading && this.state.deviceList.map((data, i) =>
                            <div key={i} className={`device-view ${this.state.deviceSected == data ? "" : "notsel"}`} style={{ background: this.state.deviceSected == data ? "#c1f7f7" : data.platform == 1 ? "#defae7" : (data.platform == 0 || data.name.endsWith("on Mac")) ? "#ddd" : data.name.endsWith("on Linux") ? "#f7ecdc" : "#dae6f5" }}
                                onClick={() => this.setState({ deviceSected: this.state.deviceList[i] })}>
                                {/* {renderFileIcon(data.name, 50)} */}
                                <i style={{ color: "#555" }} className={`las la-${data.platform != 2 ? "mobile" : "laptop"} la-3x`} />
                                <p id="device-name" className="font-weight-light mt-2 mb-0"
                                    style={{ maxWidth: "90%", lineHeight: "18px" }}>{data.name}</p>
                            </div>
                        )
                    }
                </div>}
                {this.state.selectedFiles.length > 0 &&
                    <button className="btnx mt-4 mx-auto d-block" onClick={() => { this.uploadFiles() }}>
                        <span className="circle">
                            <span className="icon arrow"></span>
                        </span>
                        <div className="button-text h-100">
                            <p className="d-block my-auto" align="center">Upload Files</p>
                        </div>
                    </button>}
            </div>
        )
    }

    renderLeft = () => {
        let isSendingfile = this.state.selectedFiles.length > 0;
        return (
            <div className={`left-area ${this.state.showLeft ? 'show' : ''}`}>
                <button className="btn-close-left" onClick={(e) => { this.setState({ showLeft: false }) }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="feather feather-x-circle" viewBox="0 0 24 24">
                        <defs />
                        <circle cx="12" cy="12" r="10" />
                        <path d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                </button>
                <SettingsModal
                    show={this.state.settingsModal} user={this.state.user}
                    onHide={() => this.setState({ settingsModal: false })}
                />
                <div className="app-name">Synk</div>
                <a className={`item-link ${this.state.activeTab <= 2 && !isSendingfile ? 'active' : ''}`} id="pageLink" data-tip="Home" onClick={(e) => { this.setState({ activeTab: 1 }) }}>
                    {this.state.tabType == '' ? <svg
                        xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" className="feather feather-grid" viewBox="0 0 24 24">
                        <defs />
                        <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
                    </svg> : <i className="lar la-folder la-2x"></i>
                    }
                </a>
                {/* <a className={`item-link ${this.state.activeTab === 2 && !isSendingfile ? 'active' : ''}`} id="pageLink" data-tip="Vault" onClick={(e) => { this.setState({ activeTab: 2 }) }}>
                    <i className="lar la-folder la-2x"></i>
                </a> */}
                <a className={`item-link ${isSendingfile ? 'active' : ''}`} data-tip="Add file(s)" id="pageLink" onClick={(e) => { this.inputRef.current.click() }}>
                    <i className="las la-plus la-2x" />
                </a>
                <a className={`item-link ${this.state.activeTab === 3 && !isSendingfile ? 'active' : ''}`} data-tip="Send Text" id="pageLink" onClick={(e) => { this.setState({ activeTab: 3 }) }}>
                    <i className="las la-quote-right la-2x"></i>
                </a>
                <a className="item-link" data-tip="Settings" onClick={() => this.setState({ settingsModal: true })} id="pageLink">
                    <i className="las la-cog la-2x"></i>
                </a>
                <a className="btn-logout" data-tip="Logout" onClick={this.onLogout}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" className="feather feather-log-out" viewBox="0 0 24 24">
                        <defs />
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /> </svg>
                </a>
            </div>
        )
    }

    renderCenter = () => {
        return (
            <div className="main-area"
                onDragOver={this.dragOver}
                onDragEnter={this.dragEnter}
                onDragLeave={this.dragLeave}
                onDrop={this.fileDrop}
            >
                {this.renderDrop()}
                <button className="btn-show-right-area" onClick={(e) => { this.setState({ showRight: true }) }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-left">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <button className="btn-show-left-area" onClick={(e) => { this.setState({ showLeft: true }) }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
                {this.state.activeTab !== 3 && <div className="main-area-header">
                    <div className="search-wrapper" id="searchLine">
                        <input className="search-input" type="text" placeholder={this.state.tabType != "" ? "Search " + this.state.tabType : "Search e.g. files.doc"} />
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="feather feather-search" viewBox="0 0 24 24">
                            <defs />
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" /> </svg>
                    </div>
                </div>}
                {this.state.activeTab === 1 && this.renderHome()}
                {(this.state.drag === 0 && this.state.activeTab == 2 && this.state.tabType != "") &&
                    <section className="content-section mt-0">
                        <h1 className="section-header selectable" onClick={() => { this.props.history.push('/'); this.setState({ activeTab: 1, tabType: '' }) }}><i className="las la-chevron-left" />{" "} Quick Access: {this.state.tabType}</h1>
                        <Quick typeSelected={this.state.tabType} fileList={this.state.fileList} />
                    </section>
                }
                {this.state.activeTab === 3 && this.renderSendText()}
            </div>)
    }

    renderSendText = () => {
        return (
            <section className="content-section mt-2">
                <div className="section-header-wrapper mt-5">
                    <h1 className="section-header">Send Text</h1>
                    {/* <a className="section-header-link">
                        View All
                    </a> */}
                </div>
                <div className="draftjs">
                    <textarea ref={r => this.sendTexRef = r} placeholder={"Write your text here \n···"} autoFocus={true} spellCheck={true} wrap="soft"></textarea>
                </div>
                <div className="section-header-wrapper mt-3">
                    <h1 className="section-header">Select Device</h1>
                    {this.state.deviceList.length > 6 && <a className="section-header-link">
                        View All
                    </a>}
                </div>
                {this.state.selectedFiles.length >= 0 && <div className="device-display-container">
                    {
                        !this.state.deviceLoading && this.state.deviceList.map((data, i) =>
                            <div key={i} className={`device-view ${this.state.deviceSected == data ? "" : "notsel"}`} style={{ background: this.state.deviceSected == data ? "#c1f7f7" : data.platform == 1 ? "#defae7" : (data.platform == 0 || data.name.endsWith("on Mac")) ? "#ddd" : data.name.endsWith("on Linux") ? "#f7ecdc" : "#dae6f5" }}
                                onClick={() => this.setState({ deviceSected: this.state.deviceList[i] })}>
                                {/* {renderFileIcon(data.name, 50)} */}
                                <i style={{ color: "#555" }} className={`las la-${data.platform != 2 ? "mobile" : "laptop"} la-3x`} />
                                <p id="device-name" className="font-weight-light mt-2 mb-0"
                                    style={{ maxWidth: "90%", lineHeight: "18px" }}>{data.name}</p>
                            </div>
                        )
                    }
                </div>}
                <div className="d-flex justify-content-center">
                    {this.state.selectedFiles.length >= 0 && <button className="btnx mt-4 mx-auto d-block" style={{ alignSelf: 'center' }} onClick={() => {
                        if (this.sendTexRef == null || this.sendTexRef.value.trim() == "") {
                            toast.dark('❗ Text field is empty!');
                            return
                        }
                        let text = this.sendTexRef.value;

                        axios.post(`${baseUrl}/text/`, {
                            username: this.state.user.username,
                            recieverName: this.state.deviceSected.name,
                            senderName: "Website",
                            text: text,
                            token: this.state.deviceSected.token,
                            title: 'Recievd a message from Synk Web',
                            body: text,
                            content: JSON.stringify({ caption: text }),
                        })
                            .then(() => toast.dark('🙌 Message sent!'))
                            .catch((err) => {
                                toast.dark('❗ Message could not be sent! :' + err)
                            })

                    }}>
                        <span className="circle">
                            <span className="icon arrow"></span>
                        </span>
                        <div className="button-text h-100" id="send-text">
                            <p className="d-block my-auto" align="center">Send Text</p>
                        </div>
                    </button>}
                </div>
            </section>

        )
    }

    renderHome = () => {
        let files = this.state.fileList.slice(0, 3) || [];
        return (
            <div style={{ visibility: (this.state.drag > 0) ? "hidden" : "visible" }}>
                <section className="content-section mt-0">
                    <h1 className="section-header">Quick Access</h1>
                    <div className="access-links">
                        {/* Images */}     <div className="access-link-wrapper" onClick={() => this.filter("Images")}>
                            <div className="access-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-image">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" /> </svg>
                            </div> <span className="access-text">Images</span> </div>
                        {/* Music */}      <div className="access-link-wrapper" onClick={() => this.filter("Music")}>
                            <div className="access-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-music">
                                    <path d="M9 18V5l12-2v13" />
                                    <circle cx="6" cy="18" r="3" />
                                    <circle cx="18" cy="16" r="3" /> </svg>
                            </div> <span className="access-text">Music</span> </div>
                        {/* Videos */}      <div className="access-link-wrapper" onClick={() => this.filter("Videos")}>
                            <div className="access-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-play">
                                    <polygon points="5 3 19 12 5 21 5 3" /> </svg>
                            </div> <span className="access-text">Videos</span> </div>
                        {/* Docs */}       <div className="access-link-wrapper" onClick={() => this.filter("Docs")}>
                            <div className="access-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-align-left">
                                    <line x1="17" y1="10" x2="3" y2="10" />
                                    <line x1="21" y1="6" x2="3" y2="6" />
                                    <line x1="21" y1="14" x2="3" y2="14" />
                                    <line x1="17" y1="18" x2="3" y2="18" /> </svg>
                            </div> <span className="access-text">Docs</span> </div>
                        {/* Apps */}       <div className="access-link-wrapper" onClick={() => this.filter("Apps")}>
                            <div className="access-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-layers">
                                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                    <polyline points="2 17 12 22 22 17" />
                                    <polyline points="2 12 12 17 22 12" /> </svg>
                            </div> <span className="access-text">Apps</span> </div>
                        {/* Compressed */}   <div className="access-link-wrapper" onClick={() => this.filter("Compressed")}>
                            <div className="access-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-package"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                            </div> <span className="access-text">Compressed</span> </div>
                    </div>
                </section>
                {(files?.length ?? 0) > 0 && <section className="content-section mt-0 mb-0">
                    <div className="section-header-wrapper">
                        <h1 className="section-header">Recent Files</h1>
                    </div>
                    <div className="section-part">
                        <FilePreview file={files[0]} big image={this.props.typeSelected === "Images"} />
                        <FilePreview file={files[1]} image={this.props.typeSelected === "Images"} />
                        <FilePreview file={files[2]} image={this.props.typeSelected === "Images"} />
                    </div>
                </section>}
                {(this.state.recentTexts !== null && this.state.recentTexts?.length !== 0) && <section className="content-section mt-2">
                    <div className="section-header-wrapper">
                        <h1 className="section-header">Recent Texts</h1>
                        <a className="section-header-link" href="/?tab=texts">View all texts</a>
                    </div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th colSpan={4}>Message</th>
                                <th colSpan={2} >Sent to</th>
                                <th >Sent</th>
                                <th className="action-cell">Action</th>
                            </tr>
                        </thead>
                        <SimpleBar className="tbody">
                            {this.state.recentTexts == null
                                ? (
                                    <tr>
                                        <td colSpan={4} >Loading</td>
                                        <td colSpan={2}> -- </td>
                                        <td> -- </td>
                                        <td>
                                            <button className="more-action"></button>
                                        </td>
                                    </tr>)
                                : this.state.recentTexts.filter(val => val.senderName == "Website").map((val, i) => (
                                    <tr key={i}>
                                        <td colSpan={4} >{val.text.length > 100 ? val.text.slice(0, 100) + " ..." : val.text}</td>
                                        <td colSpan={2}>{val.recieverName}</td>
                                        <td>{moment(val.createdAt).fromNow()}</td>
                                        <td>
                                            <button className="more-action"></button>
                                        </td>
                                    </tr>
                                ))
                            }</SimpleBar>
                    </table>
                </section>}
            </div>
        )
    }

    renderRight = () => {
        return (
            <SimpleBar className={`right-area ${this.state.showRight ? 'show' : ''}`}>
                <button className="btn-close-right" onClick={(e) => { this.setState({ showRight: false }) }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="feather feather-x-circle" viewBox="0 0 24 24">
                        <defs />
                        <circle cx="12" cy="12" r="10" />
                        <path d="M15 9l-6 6M9 9l6 6" /> </svg>
                </button>
                {this.state.uploadArray.length > this.state.countDone ? <><div>
                    <div className="right-area-header-wrapper">
                        <p className="right-area-header">Files Uploading</p>
                        <button className="more-action"></button>
                    </div>
                    <SimpleBar className="right-files">
                        <div>
                            {
                                this.state.uploadArray.map((file, i) => (file.done < 100 && this.renderUploadCard(file, i)))
                            }
                        </div>
                    </SimpleBar>
                </div> <br /></> : ""}
                {this.state.sentGrouped.length > 0 || this.state.countDone > 0
                    ? <div>
                        <div className="right-area-header-wrapper">
                            <p className="right-area-header">Files Sent</p>
                            <button className="more-action"></button>
                        </div>
                        <SimpleBar className="right-files" style={{ maxHeight: this.state.recGrouped.length == 0 ? "785px" : "340px" }}>
                            {this.state.countDone > 0 && <div>
                                <div className="download-item-line">
                                    <div className="line-header">Uploaded Just Now</div>
                                    {
                                        this.state.uploadArray.map((file, i) => (file.done === 100 && this.renderDownloadCard(file, 0, i)))
                                    }
                                </div>
                            </div>}
                            {this.state.sentGrouped.map((partday, i) => (
                                <div key={i}>
                                    <div className="download-item-line">
                                        <div className="line-header">{parseDate(partday[0].createdAt)}</div>
                                        {
                                            partday.map((file, j) => (this.renderDownloadCard(file, i, j)))
                                        }
                                    </div>
                                </div>
                            ))}
                        </SimpleBar>
                    </div> : ""}
                <br />


                {this.state.recGrouped.length > 0 ? <div>
                    <div className="right-area-header-wrapper">
                        <p className="right-area-header">Files Recieved</p>
                        <button className="more-action"></button>
                    </div>
                    <SimpleBar className="right-files" style={{ maxHeight: this.state.sentGrouped.length == 0 ? "100%" : "728px" }}>
                        {this.state.recGrouped.map((partday, i) => (
                            <div key={i}>
                                <div className="download-item-line">
                                    <div className="line-header">{parseDate(partday[0].createdAt)}</div>
                                    {
                                        partday.map((file, j) => (this.renderDownloadCard(file, i, j)))
                                    }
                                </div>
                            </div>
                        ))}
                    </SimpleBar>
                </div> : ""}
            </SimpleBar>
        )
    }

    onLogout = () => {
        removeUserSession();
        toast.dark('👋 Logged out!');
        this.props.history.push('/enter');
    }

    preventDefault = (e) => {
        e.preventDefault()
        // e.stopPropagation();
    }

    dragOver = (e) => {
        this.preventDefault(e);
        // this.setState({drag: true})
    }

    dragEnter = (e) => {
        this.preventDefault(e);
        this.setState({ drag: this.state.drag + 1 })
    }

    dragLeave = (e) => {
        this.preventDefault(e);
        this.setState({ drag: this.state.drag - 1 })
    }

    fileDrop = (e) => {
        this.preventDefault(e)
        this.setState({ drag: 0 })
        this.handleFiles(e.dataTransfer.files)
    }


    handleFiles = async (files) => {
        let tempArray = this.state.selectedFiles
        for (let i = 0; i < files.length; i++) {
            tempArray.push(files[i])
        }
        this.setState({ selectedFiles: tempArray })
    }

    fileSize = (size) => {
        if (size === 0) {
            return '0 B';
        }
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    fileType = (fileName) => {
        var val = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length);
        return val.length < 10 ? val : ""
    }

    removeFile = (name) => {
        let tempArray = this.state.selectedFiles
        const index = tempArray.findIndex(e => e.name === name)
        tempArray.splice(index, 1)
        this.setState({ selectedFiles: tempArray })
    }

    updateArray = (index, value) => {
        let tempArray = this.state.uploadArray
        tempArray[index].done = value
        if (value === 100)
            this.setState({ countDone: this.state.countDone + 1 })
        this.setState({ uploadArray: tempArray })
    }


    uploadFiles = async () => {
        let tempArray = this.state.selectedFiles
        for (let i in tempArray) {
            tempArray[i].done = 0
            tempArray[i].caption = "Caption"
            tempArray[i].recieverName = "Temp"
            tempArray[i].createdAt = new Date()
            await this.setState({ uploadArray: [...this.state.uploadArray, tempArray[i]] })
        }
        this.setState({ selectedFiles: [] })
        for (let i in tempArray) {
            console.log("File:", tempArray[i])
            const formData = new FormData();
            formData.append('caption', "Caption");
            formData.append('username', this.state.user.username);
            formData.append('recieverName', this.state.deviceSected.name);
            formData.append('senderName', "Website");
            formData.append('file', tempArray[i]);
            formData.append('token', this.state.deviceSected.token);
            formData.append('thumb', tempArray[i]?.thumb ?? "")
            formData.append('title', 'Recieved a file from Synk Web')
            formData.append('body', `${tempArray[i].name.trim(0, 11)},  Size: ${this.fileSize(tempArray[i].size)}`)
            formData.append('content', JSON.stringify({ senderName: 'Website', caption: 'Caption', username: this.state.user.username, recieverName: this.state.recieverName }))
            axios.post(`${baseUrl}/file/`, formData, {
                onUploadProgress: (e) => {
                    const percent = Math.floor((e.loaded / e.total) * 100);
                    console.log("Upload", i, percent)
                    this.updateArray(i, percent)
                }
            })
                .then((res) => {
                    let tempArray = this.state.uploadArray
                    tempArray[index].done = 100
                    tempArray[index].filename = res.data.filename
                    this.setState({ uploadArray: tempArray })

                })
                .catch((err) => {
                    this.updateArray(i, -10)
                })
        }
    }

    render() {
        return (
            <div>
                <div className="app-container unselectable">
                    {this.renderLeft()}
                    {this.renderCenter()}
                    {this.renderRight()}
                    <input
                        type="file"
                        multiple
                        ref={this.inputRef}
                        style={{ display: "none" }}
                        onChange={(event) => {
                            this.handleFiles(event.target.files)
                        }}
                    />
                </div>
                <ReactTooltip place="bottom" type="dark" effect="solid" />
            </div>
        )
    }
}