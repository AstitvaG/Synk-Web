/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import { getFileType, fileType, getUser, renderFileIcon } from '../utils/common';
import moment from 'moment';
import axios from 'axios';
import { Modal } from 'react-bootstrap';


class Quick extends Component {


    constructor(props) {
        super(props);
        this.state = {
            files: [],
            user: getUser(),
            showPreview: -1,
            isShown: false,
        }
    }



    componentDidMount = async () => {
        var files = null, selected = this.props.typeSelected, all = this.props.fileList;
        if ((all?.size ?? 0) === 0) {
            all = await axios.get('https://web-synk.azurewebsites.net/file/recent/25', { params: { username: this.state.user.username } })
                .catch(err => console.log(err));
            all = all?.data?.files ?? [];
        }

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

    renderTwo = (index) => {
        var fi = this.state.files[index], se = this.state.files[index + 1];
        return (
            <div className="section-part">
                <div className="content-part-line">
                    {fi !== undefined && <a onClick={() => this.setState({ showPreview: index })} className="image-wrapper">
                        <div className="image-overlay">
                            <div className="video-info">
                                <div className="video-info-text">
                                    <p className="video-name tiny">{fi.originalName}</p>
                                    <p className="video-subtext tiny">{moment(fi.createdAt).fromNow()}</p>
                                </div>
                            </div>
                        </div>
                        <img src={"https://web-synk.azurewebsites.net/file/thumb/" + fi.filename} ref={ref => this[`imgFi-${index}`] = ref} onError={
                            () => this[`imgFi-${index}`].src = "https://web-synk.azurewebsites.net/file/render/" + fi.filename} />
                        <span className="video-time">{fileType(fi.originalName).toUpperCase()}</span>
                    </a>}
                    {se !== undefined && <a onClick={() => this.setState({ showPreview: index + 1 })} className="image-wrapper">
                        <div className="image-overlay">
                            <div className="video-info">
                                <div className="video-info-text">
                                    <p className="video-name tiny">{se.originalName}</p>
                                    <p className="video-subtext tiny">{moment(se.createdAt).fromNow()}</p>
                                </div>
                            </div>
                        </div>
                        <img src={"https://web-synk.azurewebsites.net/file/thumb/" + se.filename} ref={ref => this[`imgSe-${index}`] = ref} onError={
                            () => this[`imgSe-${index}`].src = "https://web-synk.azurewebsites.net/file/render/" + se.filename} />
                        <span className="video-time">{fileType(se.originalName).toUpperCase()}</span>
                    </a>}
                </div>
            </div>
        )
    }

    renderRow = (index) => {
        return (
            <div className="content-section-line mv">
                {this.renderTwo(index)}
                {this.renderTwo(index + 2)}
            </div>
        )
    }

    renderFirst = () => {
        var temp = this.state.files[0]
        return (
            <div className="content-section-line mv">
                <div className="section-part">
                    <a onClick={() => this.setState({ showPreview: 0 })} className="image-wrapper big">
                        <div className="image-overlay">
                            <div className="video-info">
                                <div className="video-info-text">
                                    <p className="video-name medium">{temp.originalName}</p>
                                    <p className="video-subtext medium">{moment(temp.createdAt).fromNow()}</p>
                                </div>
                                <button className="btn-play"></button>
                            </div>
                        </div>
                        <img src={"https://web-synk.azurewebsites.net/file/thumb/" + temp.filename} ref={ref => this[`imgTh-${0}`] = ref} onError={
                            () => this[`imgTh-${0}`].src = "https://web-synk.azurewebsites.net/file/render/" + temp.filename} />
                        <span className="video-time">{fileType(temp.originalName).toUpperCase()}</span>
                    </a>
                </div>
                { this.renderTwo(1)}
            </div >
        )
    }

    renderImagePreview = () => {
        if ((this.state.files?.length ?? 0) === 0 || this.state.showPreview === -1) return null
        let temp = this.state.files[this.state.showPreview];
        return (
            <Modal
                show={this.state.showPreview !== -1}
                onHide={() => this.setState({ showPreview: -1 })}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                className="p-0">
                <div class="modal-content">
                    <div class="modal-body">
                        <a onMouseEnter={() => this.setState({ isShown: true })}
                            onMouseLeave={() => this.setState({ isShown: false })}
                            href={"https://web-synk.azurewebsites.net/file/render/" + temp.filename} target="_blank" style={{ width: "100%", maxHeight: "80vh" }}>
                            {this.state.isShown && <div className="image-overlay prev">
                                <div className="video-info">
                                    <div className="video-info-text">
                                        <p className="video-name medium">{temp.originalName}</p>
                                        <p className="video-subtext medium">{moment(temp.createdAt).fromNow()}</p>
                                    </div>
                                    {/* <button className="btn-play"></button> */}
                                </div>
                            </div>}
                            <img src={"https://web-synk.azurewebsites.net/file/render/" + temp.filename} class="imagepreview" style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}>
                            </img>
                        </a>
                        <button type="button" onClick={() => this.setState({ showPreview: -1 })} class="close position-absolute btn-close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                    </div>
                </div>
            </Modal>
        )
    }

    renderOthers = () => {
        var len = this.state.files.length, arr = [];
        for (let i = 3; i < len; i += 4) {
            arr.push(i);
        }
        return (
            arr.map((value, key) =>
                <div key={key}>
                    {this.renderRow(value)}
                </div>
            )
        )
    }

    renderImageTab = () => {
        var { files } = this.state;
        return (
            <>
                {this.renderImagePreview()}
                {files.length > 0 && this.renderFirst()}
                {files.length > 3 && this.renderOthers()}
            </>
        )
    }

    renderGeneric = (file, index) => {
        if (file === undefined) return null;
        let iconData = renderFileIcon(fileType(file.originalName).toLowerCase(), -1, true);
        return (
            <a href={"https://web-synk.azurewebsites.net/file/render/" + file.filename} target="_blank" className="image-wrapper">
                <div className="image-overlay">
                    <div className="video-info">
                        <div className="video-info-text">
                            <p className="video-name tiny">{file.originalName}</p>
                            <p className="video-subtext tiny">{moment(file.createdAt).fromNow()}</p>
                        </div>
                    </div>
                </div>
                <div style={{ backgroundColor: iconData[0], width: "100%", height: "100%", justifyContent: "center", alignItems: "center", display: "flex" }}>
                    <i className={`${iconData[1]} image-icon`} style={{ fontSize: (150 * 1.33 / 40) + "em", color: "white", zIndex: 2 }}></i>
                </div>
                <span className="video-time">{fileType(file.originalName).toUpperCase()}</span>
            </a>
        )

    }

    renderDocsTab = () => {
        var { files } = this.state;
        var len = this.state.files?.length ?? 0, arr = [];
        for (let i = 0; i < len; i += 4) {
            arr.push(i);
        }
        return (
            arr.map((value, index) =>
                <div key={index} className="content-section-line mv">
                    <div className="section-part">
                        <div className="content-part-line">
                            {this.renderGeneric(files[index], index)}
                            {this.renderGeneric(files[index + 1], index + 1)}
                        </div>
                    </div>
                    <div className="section-part">
                        <div className="content-part-line">
                            {this.renderGeneric(files[index + 2], index + 2)}
                            {this.renderGeneric(files[index + 4], index + 4)}
                        </div>
                    </div>
                    {/* {this.renderRow(value)} */}
                </div>
            )
        )
        // return null;
    }


    render() {
        let type = this.props.typeSelected
        return (
            <>
                {type === 'Images'
                    ? this.renderImageTab()
                    : this.renderDocsTab()
                }
            </>
        );
    }
}

export default Quick;
