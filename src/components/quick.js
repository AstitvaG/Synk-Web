/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import { getFileType, fileType, getUser, renderFileIcon, baseUrl } from '../utils/common';
import moment from 'moment';
import axios from 'axios';
import { Modal } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import ReactAudioPlayer from 'react-audio-player';
import empty from '../images/empty.png';

// class MusicPlayer extends Component {
//     state = {
//         playing: null
//     }
// }

class FilePreview extends Component {

    state = {
        exists: false,
        playing: null,
        hover: false,
    }

    componentDidMount = () => {
        if (this.props.file === undefined) return;
        axios.head(`${baseUrl}/file/hasthumb/${this.props.file.filename}`)
            .then((res) => this.setState({ exists: res.status === 200 }))
    }

    componentDidUpdate(prvProps, prvState) {
        if (this.props.file.done === 100 && prvProps.file.filename !== this.props.file.filename)
            setTimeout(() => {
                axios.head(`${baseUrl}/file/hasthumb/${this.props.file.filename}`)
                    .then((res) => this.setState({ exists: res.status === 200 }))
            }, 2000);
        if (this.props.music && prvProps.cantPlay === false && this.player && this.props.cantPlay === true) {
            this.player.audioEl.current.pause();
            this.setState({ playing: false })
        }
    }

    propsToCb = (file) => {
        if (this.props.music) {
            if (this.state.playing === null) {
                this.setState({ playing: true })
                if (this.props.cb) this.props.cb(true);
                return;
            }
            if (!this.player) return
            if (this.player.audioEl.current.paused) {
                this.player.audioEl.current.play();
                this.setState({ playing: true })
                if (this.props.cb) this.props.cb(true);
            }
            else {
                this.player.audioEl.current.pause();
                this.setState({ playing: false })
                if (this.props.cb) this.props.cb(false);
            }
        }
        else if (this.props.cb) this.props.cb();
        else window.open(`${baseUrl}/file/render/${file.filename}`, "_blank")
    }

    renderWithoutThumb(file) {
        let iconData = renderFileIcon(fileType(file.originalName).toLowerCase(), -1, true);
        let big = this.props.big ? "big" : "";
        return (
            <a onClick={() => this.propsToCb(file)} className={`image-wrapper ${big}`}
                onMouseEnter={() => this.setState({ hover: true })}
                onMouseLeave={() => this.setState({ hover: false })}>
                <div className="image-overlay">
                    <div className="video-info">
                        <div className="video-info-text">
                            <p className={`video-name ${big === "big" ? "medium" : "tiny"}`}>{file.originalName.split('.').slice(0, -1).join('.')}</p>
                            <p className={`video-subtext ${big === "big" ? "medium" : "tiny"}`}>{moment(file.createdAt).fromNow()}</p>
                        </div>
                    </div>
                </div>
                <div style={{ backgroundColor: iconData[0], width: "100%", height: "100%", justifyContent: "center", alignItems: "center", display: "flex" }}>
                    {(!this.props.music || (!this.state.hover && !this.state.playing)) && <i className={`${iconData[1]} image-icon`} style={{ fontSize: (150 * 1.33 / 40) + "em", color: "white", zIndex: 2 }}></i>}
                </div>
                {this.props.music && < div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 2, justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                    {this.state.playing !== null && <ReactAudioPlayer onEnded={() => this.setState({ playing: false })}
                        src={`${baseUrl}/file/render/${file.filename}`}
                        ref={(r) => this.player = r}
                        autoPlay
                    />}
                    {(this.state.hover || this.state.playing) && <div className="access-icon">
                        {this.state.playing === true
                            ? <svg style={{ width: '50px', height: '50px' }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-pause"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                            : <svg style={{ width: '50px', height: '50px' }} xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-play"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        }
                    </div>}
                </div>}
                <span className="video-time">{fileType(file.originalName).toUpperCase()}</span>
            </a >
        )
    }



    renderWithThumb = (file) => {
        let big = this.props.big ? "big" : "";
        return (
            <a onClick={() => this.propsToCb(file)} className={`image-wrapper ${big}`}
                onMouseEnter={() => this.setState({ hover: true })}
                onMouseLeave={() => this.setState({ hover: false })}>
                <div className="image-overlay">
                    <div className="video-info">
                        <div className="video-info-text">
                            <p className={`video-name ${big === "big" ? "medium" : "tiny"}`}>{file.originalName.split('.').slice(0, -1).join('.')}</p>
                            <p className={`video-subtext ${big === "big" ? "medium" : "tiny"}`}>{moment(file.createdAt).fromNow()}</p>
                        </div>
                    </div>
                </div>
                <img src={`${baseUrl}/file/thumb/${file.filename}`} alt={file.originalName} onError={_ => this.setState({ exists: false })} />
                {
                    this.props.music && <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 2, justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                        {this.state.playing !== null && <ReactAudioPlayer
                            src={`${baseUrl}/file/render/${file.filename}`}
                            ref={(r) => this.player = r}
                            autoPlay
                        />}
                        {(this.state.hover || this.state.playing) && <div className="access-icon">
                            {this.state.playing === true
                                ? <svg style={{ width: '50px', height: '50px' }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-pause"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                                : <svg style={{ width: '50px', height: '50px' }} xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-play"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                            }
                        </div>}
                    </div>
                }
                <span className="video-time">{fileType(file.originalName).toUpperCase()}</span>
            </a >
        )
    }

    render() {
        let { file } = this.props
        if (file === undefined) return null;
        if (this.state.exists)
            return this.renderWithThumb(file);
        else
            return this.renderWithoutThumb(file);
    }
}


class Quick extends Component {


    constructor(props) {
        super(props);
        this.state = {
            files: null,
            page: 0,
            user: getUser(),
            showPreview: -1,
            isShown: false,
            isPlaying: -1,
        }
    }



    componentDidMount = async () => {
        var files = null, selected = this.props.typeSelected, all = [];
        all = await this.getMoreData(all);

        const chk = (name, type) => {
            if (type[0])
                return type.includes(getFileType(fileType(name)))
            return getFileType(fileType(name)) === type;
        }
        if (selected) {
            if (selected === "Images") files = all.filter((value) => chk(value.filename, 1));
            else if (selected === "Codes") files = all.filter((value) => chk(value.filename, 6));
            else if (selected === "Music") files = all.filter((value) => chk(value.filename, 12));
            else if (selected === "Videos") files = all.filter((value) => chk(value.filename, 7));
            else if (selected === "Docs") files = all.filter((value) => chk(value.filename, [2, 3, 4, 5]));
            else if (selected === "Apps") files = all.filter((value) => ["apk", "msi", "exe", "deb"].includes(fileType(value.filename)));
            else if (selected === "Compressed") files = all.filter((value) => chk(value.filename, 0));
            this.setState({ files })
        }
    };

    getMoreData = async (all) => {
        all = await axios.get(`${baseUrl}/file/all/${this.props?.typeSelected ?? " "}`, { params: { username: this.state.user.username, page: this.state.page + 2 } })
            .catch(err => console.log(err));
        all = all?.data ?? [];
        return all;
    }

    renderImagePreview = () => {
        if (this.state.showPreview === -1) return null
        let temp = this.state.files[this.state.showPreview];
        return (
            <Modal
                show={this.state.showPreview !== -1}
                onHide={() => this.setState({ showPreview: -1 })}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                className="p-0">
                <div className="modal-content">
                    <div className="modal-body">
                        <a onMouseEnter={() => this.setState({ isShown: true })}
                            onMouseLeave={() => this.setState({ isShown: false })}
                            href={`${baseUrl}/file/render/${temp.filename}`} target="_blank" rel="noopener noreferrer" style={{ width: "100%", maxHeight: "80vh" }}>
                            {this.state.isShown && <div className="image-overlay prev">
                                <div className="video-info">
                                    <div className="video-info-text">
                                        <p className="video-name medium">{temp.originalName}</p>
                                        <p className="video-subtext medium">{moment(temp.createdAt).fromNow()}</p>
                                    </div>
                                    {/* <button className="btn-play"></button> */}
                                </div>
                            </div>}
                            <img src={`${baseUrl}/file/render/${temp.filename}`} alt={temp.originalName} className="imagepreview" style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}>
                            </img>
                        </a>
                        <button type="button" onClick={() => this.setState({ showPreview: -1 })} className="close position-absolute btn-close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span className="sr-only">Close</span></button>
                    </div>
                </div>
            </Modal>
        )
    }


    render = () => {
        var { files } = this.state;
        var image = this.props.typeSelected === "Images";
        var music = this.props.typeSelected === "Music";
        var len = this.state.files?.length ?? 0
        if (this.state.files === null) return null;
        else if (len === 0 && this.state.files !== null)
            return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <img style={{ objectFit: 'cover', width: '508px', height: '278px' }} src={empty} alt="No file found" />
                <div style={{ color: 'gray', marginTop: '20px', fontSize: '20px' }}>No results found <span role="img" aria-labelledby="search">🔍</span></div>
            </div>
        return (
            <SimpleBar style={{ height: "735px", display: 'flex' }} >
                {this.renderImagePreview()}
                <div className="section-part">
                    {files.map((value, index) => <FilePreview index={index} key={index} cantPlay={this.state.isPlaying !== index && this.state.isPlaying !== -1} big={index === 0} file={value} image={image} music={music} cb={image ? () => this.setState({ showPreview: index }) : music ? (b) => this.setState({ isPlaying: b ? index : -1 }) : null} />)}
                </div>
            </SimpleBar>
        )
    }

}

export default Quick;
export { FilePreview };