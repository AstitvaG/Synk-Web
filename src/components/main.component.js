/* eslint-disable */
import React, { Component } from 'react';
import axios from 'axios';
import './main.component.css';
import $ from 'jquery';
import moment from 'moment';
// import './Dropzone.css';
import ClipLoader from "react-spinners/ClipLoader";

export default class Main extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 1,
            showLeft: false,
            showRight: false,
            fileList: [],
            datewiseGrouped: [],
            drag: 0,
            senderId: localStorage.getItem('userId'),
            recieverName: '',
            caption: '',
            userOs: localStorage.getItem('userOs'),
            selectedFiles: [],
            UrlArray: [],
            errorMessage: '',
            closeIcon: -1,
            uploadArray: [],
            countDone: 0,
        }
    }


    componentDidMount() {
        $('.main-area').scroll(function () {
            if ($('.main-area').scrollTop() >= 88) {
                $('div.main-area-header').addClass('fixed');
            }
            else {
                $('div.main-area-header').removeClass('fixed');
            }
        });
        axios.get('https://web.synk.tools/file/recent/25')
            .then(response => {
                this.setState({ fileList: response.data.files });
                this.groupFiles(response.data.files)
            })
            .catch(err => alert(err));
        
    }

    groupFiles = (arr) => {
        var done = new Array(), ret = new Array(), tem = new Array()
        for(var item in arr){
            if(!done.includes(moment(arr[item].createdAt).format("dd MMM yyyy"))){
                if(tem.length>0) ret.push(tem)
                tem = new Array()
                done.push(moment(arr[item].createdAt).format("dd MMM yyyy"))
            }
            tem.push(arr[item])
        }
        if(tem.length>0) ret.push(tem)
        this.setState({datewiseGrouped: ret})
    }

    parseDate = (dateString) => {
        var today = moment();
        var yesterday = moment().subtract(1, 'day');
        var engagementDate = new Date(dateString);
        if(moment(engagementDate).isSame(today, 'day'))
            return 'Today, ' + moment(dateString).format("Do MMMM yyyy")
        else if(moment(engagementDate).isSame(yesterday, 'day'))
            return 'Yesterday, ' + moment(dateString).format("Do MMMM yyyy")
        return moment(dateString).format("dddd, Do MMMM yyyy")
    }

    getFileType = (ext) => {
        if(['jpg','jpeg','png','gif','bmp','png','webp','svg'].includes(ext)) return 1
        else if(['pdf'].includes(ext)) return 2
        else if(['doc','docx'].includes(ext)) return 3
        else if(['xls','xlsx'].includes(ext)) return 4
        else if(['ppt','pptx'].includes(ext)) return 5
        else if(['sh','tex','py','java','c','cpp','js','html','css'].includes(ext)) return 6
        else if(['webm','mpg','mp2','mpeg','mpe','mpv','ogg','mp4','m4p','m4v','avi','wmv','mov','qt','flv','swf','avchd'].includes(ext)) return 7
        else if(ext=="close-icon") return 8
        else return 0
    }

    renderFileIcon = (ext,size=40) => {
        var col,ico
        switch(this.getFileType(ext)){
            case 1:
                col='#C13584', ico="far fa-file-image"
                break
            case 2:
                col='#ff0000', ico="far fa-file-pdf"
                break
            case 3:
                col='#2a5492', ico="far fa-file-word"
                break
            case 4:
                col='#247c3f', ico="far fa-file-excel"
                break
            case 5:
                col='#cd4f2f', ico="far fa-file-powerpint"
                break
            case 6:
                col='#7c007c', ico="far fa-file-code"
                break
            case 7:
                col='#f7c639', ico="far fa-file-video"
                break
            case 8:
                col='#22244a', ico="fas fa-times"
                break
            default:
                col='#555555', ico = "far fa-file-archive"
        }
        return(
            <div className="btn-circle" style={{color:"#fff",background:col,width:size+"px",height:size+"px"}}>
                <i className={ico+" m-auto"} style={{fontSize:(size*1.33/40)+"em"}}></i>
            </div>
        )
    }

    renderUploadCard = (item,idx) => {
        return (
            <div className="download-area">
                <div className="download-item-icon">
                    {this.renderFileIcon((item.name || item.originalName).split('.').pop().toLowerCase())}
                </div>
                <div className="download-item-texts">
                    <p className="download-text-header">{item.originalName || item.name}</p>
                    <p className="download-text-info">{item.caption}<span>{moment(item.createdAt).format("h:mm A")}</span></p>
                    <p className="download-text-info">To {item.recieverName}<span><i className="fab fa-android"></i></span></p>
                    <div className="progressy-bar">
                        <span className="progressy" style={{width:`${this.state.uploadArray[idx].done}%`}}></span>
                    </div>
                </div>
                <div className="download-icon">
                    <ClipLoader size={26} color="blue" />
                </div>
            </div>
        )
    }

    renderDownloadCard = (item,i,j) => {
        return (
            <div className="download-area" key={"file-"+i+"-"+j} onDoubleClick={()=> window.open("https://web.synk.tools/file/render/"+item.filename, "_blank")}>
                <div className="download-item-icon">
                    {this.renderFileIcon(this.fileType(item.name || item.originalName))}
                </div>
                <div className="download-item-texts">
                    <p className="download-text-header">{item.originalName || item.name}</p>
                    <p className="download-text-info">{item.caption}<span>{moment(item.createdAt).format("h:mm A")}</span></p>
                    <p className="download-text-info">To {item.recieverName}<span><i className="fab fa-android"></i></span></p>
                </div>
                <a href={"https://web.synk.tools/file/download/"+item.filename} download={item.originalName}>
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

    renderLeft = () => {
        return(
            <div className={`left-area ${this.state.showLeft ? 'show' : ''}`}>
                <button className="btn-close-left" onClick={(e)=>{this.setState({showLeft:false})}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="feather feather-x-circle" viewBox="0 0 24 24">
                        <defs />
                        <circle cx="12" cy="12" r="10" />
                        <path d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                </button>
                <div className="app-name">Synk</div>
                <a href="#" className={`item-link ${this.state.activeTab===1 ? 'active' : ''}`} id="pageLink" onClick={(e)=>{this.setState({activeTab:1})}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="feather feather-grid" viewBox="0 0 24 24">
                        <defs />
                        <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
                    </svg>
                </a>
                <a href="#" className={`item-link ${this.state.activeTab===2 ? 'active' : ''}`} id="pageLink" onClick={(e)=>{this.setState({activeTab:2})}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="feather feather-folder" viewBox="0 0 24 24">
                        <defs />
                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                    </svg>
                </a>
                <a href="#" className={`item-link ${this.state.activeTab===3 ? 'active' : ''}`} id="pageLink" onClick={(e)=>{this.setState({activeTab:3})}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="feather feather-hard-drive" viewBox="0 0 24 24">
                        <defs />
                        <path d="M22 12H2M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11zM6 16h.01M10 16h.01" />
                    </svg>
                </a>
                <a href="#" className={`item-link ${this.state.activeTab===4 ? 'active' : ''}`} id="pageLink" onClick={(e)=>{this.setState({activeTab:4})}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="feather feather-settings" viewBox="0 0 24 24">
                        <defs />
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                </a>
                <button className="btn-logout">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="feather feather-log-out" viewBox="0 0 24 24">
                        <defs />
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /> </svg>
                </button>
            </div>
        )
    }

    renderCenter = () => {
        return (
        <div className={`main-area`}
            onDragOver={this.dragOver}
            onDragEnter={this.dragEnter}
            onDragLeave={this.dragLeave}    
            onDrop={this.fileDrop}
        >
            <div className="drop-container" style={{
                    display: this.state.drag>0||this.state.selectedFiles.length>0?'flex':'none',
                }}
                >
                {this.state.drag>0 && <div className="drop-message">Drop files here</div>}
                <input
                    // className="file-input"
                    type="file"
                    multiple
                    style={{display:"none"}}
                    onChange={(event) => {
                        this.handleFiles(event.target.files)
                    }}
                />
                {this.state.selectedFiles.length>0 && <p className="upload-message">Files Selected</p>}
                {this.state.selectedFiles.length>1 && <p className="drop-message" style={{top: "115px"}}>{this.state.selectedFiles.length} files selected</p>}
                <div className="file-display-container">
                    {
                        this.state.selectedFiles.map((data,i)=>
                            <div class="w-75 mb-2 py-2 px-3 mx-auto d-flex justify-content-between align-items-center rounded-pill unselectable" style={{cursor:"pointer",background:"white"}}
                                    onMouseEnter={()=>this.setState({closeIcon:i})}
                                    onMouseLeave={()=>this.setState({closeIcon:-1})}
                                    onClick={() => this.removeFile(data.name)}>
                                <div class="d-flex justify-content-between align-items-center">
                                <div class="d-flex justify-content-between align-items-center">
                                    {this.state.closeIcon!=i
                                        ?this.renderFileIcon(this.fileType(data.name),50)
                                        :this.renderFileIcon("close-icon",50)
                                    }
                                    <div class="mb-3 mb-sm-0 ml-3">
                                        <p class="font-weight-bold mb-0 text-truncate" 
                                        style={{maxWidth: "240px"}}>{data.name}</p>
                                        <small class="text-secondary text-truncate">{this.fileType(data.name).toUpperCase() || "Executable"} file</small>
                                    </div>
                                </div>
                                </div>
                                <h7 class="float-right"><font size="+2">{this.fileSize(data.size).split(' ')[0]} </font>{this.fileSize(data.size).split(' ')[1]}</h7>
                            </div>
                        )
                    }
                </div>
                {this.state.selectedFiles.length>0 && <button className="btnx mt-4 mx-auto d-block" onClick={() => {this.uploadFiles()}}>
                    <span className="circle">
                        <span className="icon arrow"></span>
                    </span>
                    <div className="button-text h-100">
                        <p className="d-block my-auto" align="center">Upload Files</p>
                    </div>
                </button>}
            </div>
            <div style={{visibility:this.state.drag>0?"hidden":"visible"}}>
                <button className={`btn-show-right-area`} onClick={(e)=>{this.setState({showRight:true})}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-left">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <button className={`btn-show-left-area`} onClick={(e)=>{this.setState({showLeft:true})}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
                <div className={`main-area-header`}>
                    <div className="search-wrapper" id="searchLine">
                        <input className="search-input" type="text" placeholder="e.g. files.doc" />
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="feather feather-search" viewBox="0 0 24 24">
                            <defs />
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" /> </svg>
                    </div>
                </div>
                <section className={`content-section`}>
                    <h1 className="section-header">Quick Access</h1>
                    <div className="access-links">
                        {/* Images */}     <div className="access-link-wrapper">
                            <div className="access-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-image">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" /> </svg>
                            </div> <span className="access-text">Images</span> </div>
                        {/* Music */}      <div className="access-link-wrapper">
                            <div className="access-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-music">
                                    <path d="M9 18V5l12-2v13" />
                                    <circle cx="6" cy="18" r="3" />
                                    <circle cx="18" cy="16" r="3" /> </svg>
                            </div> <span className="access-text">Music</span> </div>
                        {/* Video */}      <div className="access-link-wrapper">
                            <div className="access-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-play">
                                    <polygon points="5 3 19 12 5 21 5 3" /> </svg>
                            </div> <span className="access-text">Video</span> </div>
                        {/* Docs */}       <div className="access-link-wrapper">
                            <div className="access-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-align-left">
                                    <line x1="17" y1="10" x2="3" y2="10" />
                                    <line x1="21" y1="6" x2="3" y2="6" />
                                    <line x1="21" y1="14" x2="3" y2="14" />
                                    <line x1="17" y1="18" x2="3" y2="18" /> </svg>
                            </div> <span className="access-text">Docs</span> </div>
                        {/* Apps */}       <div className="access-link-wrapper">
                            <div className="access-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-layers">
                                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                    <polyline points="2 17 12 22 22 17" />
                                    <polyline points="2 12 12 17 22 12" /> </svg>
                            </div> <span className="access-text">Apps</span> </div>
                        {/* Download */}   <div className="access-link-wrapper">
                            <div className="access-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-down-circle">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="8 12 12 16 16 12" />
                                    <line x1="12" y1="8" x2="12" y2="16" /> </svg>
                            </div> <span className="access-text">Download</span> </div>
                    </div>
                </section>
                <section className={`content-section`}>
                    <div className="section-header-wrapper">
                        <h1 className="section-header">Preview</h1> <a className="section-header-link">
                            View in folders
                </a> </div>
                    <div className="content-section-line">
                        <div className="section-part left">
                            <a className="image-wrapper">
                                <div className="image-overlay">
                                    <div className="video-info">
                                        <div className="video-info-text">
                                            <p className="video-name medium">Happiness & Tears</p>
                                            <p className="video-subtext medium">45.5 MB</p>
                                        </div>
                                        <button className="btn-play"></button>
                                    </div>
                                </div>
                                <img src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2251&q=80" /> <span className="video-time">10:32</span> </a>
                        </div>
                        <div className="section-part right">
                            <div className="content-part-line">
                                <a className="image-wrapper">
                                    <div className="image-overlay">
                                        <div className="video-info">
                                            <div className="video-info-text">
                                                <p className="video-name tiny">High Hopes</p>
                                                <p className="video-subtext tiny">50 MB</p>
                                            </div>
                                        </div>
                                    </div> 
                                    <img src="https://images.unsplash.com/photo-1515552726023-7125c8d07fb3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2167&q=80" /> <span className="video-time">02:35</span> </a>
                                <a className="image-wrapper">
                                    <div className="image-overlay">
                                        <div className="video-info">
                                            <div className="video-info-text">
                                                <p className="video-name tiny">Imaginery you</p>
                                                <p className="video-subtext tiny">210.2 MB</p>
                                            </div>
                                        </div>
                                    </div> 
                                    <img src="https://images.unsplash.com/photo-1542359649-31e03cd4d909?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2167&q=80" /> <span className="video-time">04:15</span> </a>
                            </div>
                        </div>
                    </div>
                </section>
                <section className={`content-section`}>
                    <div className="section-header-wrapper">
                        <h1 className="section-header">Recent Files</h1> 
                        <a className="section-header-link">
                            View all files
                        </a> 
                    </div>
                    <div className="files-table">
                        <div className="files-table-header">
                            <div className="column-header table-cell">Name</div>
                            <div className="column-header table-cell size-cell">Size</div>
                            <div className="column-header table-cell">Last Modified</div>
                            <div className="column-header table-cell">Action</div>
                            <div className="column-header table-cell">Device</div>
                        </div>
                        <div className="files-table-row">
                            <div className="table-cell name-cell pdf">Brandenburg.pdf</div>
                            <div className="table-cell">42 MB</div>
                            <div className="table-cell">Aug 26, 2020</div>
                            <div className="table-cell action-cell">
                                <button className="more-action"></button>
                            </div>
                        </div>
                        <div className="files-table-row">
                            <div className="table-cell name-cell jpg">TheLionsRoar.jpg</div>
                            <div className="table-cell size-cell">500 KB</div>
                            <div className="table-cell">Aug 26, 2020</div>
                            <div className="table-cell action-cell">
                                <button className="more-action"></button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>)
    }

    renderRight = () => {
        return (
            <div className={`right-area ${this.state.showRight ? 'show' : ''}`}>
                <button className="btn-close-right" onClick={(e)=>{this.setState({showRight:false})}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="feather feather-x-circle" viewBox="0 0 24 24">
                        <defs />
                        <circle cx="12" cy="12" r="10" />
                        <path d="M15 9l-6 6M9 9l6 6" /> </svg>
                </button>
                {this.state.uploadArray.length>this.state.countDone?<><div>
                    <div className="right-area-header-wrapper">
                        <p className="right-area-header">Files Uploading</p>
                        <button className="more-action"></button>
                    </div>
                    <div className="right-sent-files">
                        <div>
                            {
                                this.state.uploadArray.map((file,i) => (file.done<100 && this.renderUploadCard(file,i)))
                            }
                        </div>
                    </div>
                </div> <br /></>:""}
                {this.state.fileList.length>0 || this.state.countDone>0 ?<div>
                    <div className="right-area-header-wrapper">
                        <p className="right-area-header">Files Sent</p>
                        <button className="more-action"></button>
                    </div>
                    <div className="right-sent-files">
                    {this.state.countDone>0 && <div>
                        <div className="download-item-line">
                            <div className="line-header">Uploaded Just Now</div>
                            {
                                this.state.uploadArray.map((file,i) => (file.done===100 && this.renderDownloadCard(file,0,i)))
                            }
                        </div>
                    </div>}
                    {this.state.datewiseGrouped.map((partday,i) => (
                        <div key={i}>
                            <div className="download-item-line">
                                <div className="line-header">{this.parseDate(partday[0].createdAt)}</div>
                                {
                                    partday.map((file,j) => (this.renderDownloadCard(file,i,j)))
                                }
                            </div>
                        </div>
                    ))}
                    </div>
                </div>:""}
                <br />


                <div className="right-area-header-wrapper">
                    <p className="right-area-header">File Received</p>
                    <button className="more-action"></button>
                </div>
                <div className="right-rec-files">
                    <div className="received-item-line">
                        <div className="progress-line"> <span className="time start">15:30</span> <span className="time end">18:30</span> </div>
                        <div className="received-items-content">
                            <div className="received-files">
                                <div className="image-wrapper"> <img src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80" /> </div>
                                <div className="image-wrapper"> <img src="https://images.unsplash.com/photo-1498855926480-d98e83099315?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2250&q=80" /> </div>
                                <div className="image-wrapper"> <img src="https://images.unsplash.com/photo-1492648272180-61e45a8d98a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80" /> </div>
                            </div>
                            <div className="received-files-info"> Received <span className="info-purple">3 images</span> total <span className="info-purple">50.3 MB</span> </div>
                        </div>
                    </div>
                    <div className="received-item-line">
                        <div className="progress-line"> <span className="time start">15:30</span> <span className="time end">18:30</span> </div>
                        <div className="received-items-content">
                            <div className="received-files">
                                <div className="image-wrapper"> <img src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80" /> </div>
                                <div className="image-wrapper"> <img src="https://images.unsplash.com/photo-1498855926480-d98e83099315?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2250&q=80" /> </div>
                                <div className="image-wrapper"> <img src="https://images.unsplash.com/photo-1492648272180-61e45a8d98a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80" /> </div>
                            </div>
                            <div className="received-files-info"> Received <span className="info-purple">3 images</span> total <span className="info-purple">50.3 MB</span> </div>
                        </div>
                    </div>
                    <div className="received-item-line">
                        <div className="progress-line"> <span className="time start">15:30</span> <span className="time end">18:30</span> </div>
                        <div className="received-items-content">
                            <div className="received-files">
                                <div className="image-wrapper"> <img src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80" /> </div>
                                <div className="image-wrapper"> <img src="https://images.unsplash.com/photo-1498855926480-d98e83099315?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2250&q=80" /> </div>
                                <div className="image-wrapper"> <img src="https://images.unsplash.com/photo-1492648272180-61e45a8d98a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80" /> </div>
                            </div>
                            <div className="received-files-info"> Received <span className="info-purple">3 images</span> total <span className="info-purple">50.3 MB</span> </div>
                        </div>
                    </div>
                    <div className="received-item-line">
                        <div className="progress-line"> <span className="time start">15:30</span> <span className="time end">18:30</span> </div>
                        <div className="received-items-content">
                            <div className="received-files">
                                <div className="image-wrapper"> <img src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80" /> </div>
                                <div className="image-wrapper"> <img src="https://images.unsplash.com/photo-1498855926480-d98e83099315?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2250&q=80" /> </div>
                                <div className="image-wrapper"> <img src="https://images.unsplash.com/photo-1492648272180-61e45a8d98a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80" /> </div>
                            </div>
                            <div className="received-files-info"> Received <span className="info-purple">3 images</span> total <span className="info-purple">50.3 MB</span> </div>
                        </div>
                    </div>
                </div>
            </div>
        )
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
        this.setState({drag: this.state.drag+1})
    }

    dragLeave = (e) => {
        this.preventDefault(e);
        this.setState({drag: this.state.drag-1})
    }

    fileDrop = (e) => {
        this.preventDefault(e)
        this.setState({drag: 0})
        this.handleFiles(e.dataTransfer.files)
    }


    handleFiles = (files) => {
        let tempArray = this.state.selectedFiles
        let tempUrl = this.state.UrlArray
        for(let i = 0; i < files.length; i++) {
            tempArray.push(files[i])
            let reader = new FileReader();
            reader.onload = (e) => {tempUrl.push(e.target.result)}
            reader.readAsDataURL(files[i]);
        }
        this.setState({selectedFiles: tempArray,UrlArray: tempUrl})
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
        return val.length<10?val:""
    }

    removeFile = (name) => {
        let tempArray = this.state.selectedFiles
        const index = tempArray.findIndex(e => e.name === name)
        tempArray.splice(index, 1)
        this.setState({selectedFiles: tempArray})
    }

    updateArray = (index,value) => {
        let tempArray = this.state.uploadArray
        tempArray[index].done = value
        if(value===100) this.setState({countDone: this.state.countDone+1})
        this.setState({uploadArray: tempArray})
    }


    uploadFiles = async () => {
        let tempArray = this.state.selectedFiles
        for(let i in tempArray){
            tempArray[i].done = 0
            tempArray[i].senderId = this.state.senderId
            tempArray[i].caption = "Caption"
            tempArray[i].recieverName = "Temp"
            tempArray[i].createdAt = new Date()
            await this.setState({uploadArray: [...this.state.uploadArray,tempArray[i]]})
        }
        this.setState({selectedFiles: []})
        for (let i in tempArray) {
            const formData = new FormData();
            formData.append('caption', "Caption");
            formData.append('recieverName', "Temp");
            formData.append('senderId', this.state.senderId);
            formData.append('file', tempArray[i]);
            axios.post('https://web.synk.tools/file/', formData, {
                onUploadProgress: (e) => {
                    const percent = Math.floor((e.loaded / e.total) * 100);
                    console.log("Upload",i,percent)
                    this.updateArray(i,percent)
                }
            })
            .catch((err) => {
                // alert('Error: ' + err)
                this.updateArray(i,-10)
            })
        }
    }

    closeUploadModal = () => {
        this.setState({showModal: 'none'})
    }
    
    render() {
        var datesDone = []
        return (
            <div>
                <div className="app-container unselectable">
                    {this.renderLeft()}
                    {this.renderCenter()}
                    {this.renderRight()}
                </div>
            </div>
        )
    }
}