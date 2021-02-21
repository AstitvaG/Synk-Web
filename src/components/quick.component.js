/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import { getFileType, fileType, getUser, renderFileIcon } from '../utils/common';
import moment from 'moment';
import axios from 'axios';
import { Modal } from 'react-bootstrap';

class FilePreview extends Component {

    state = {
        exists: false
    }

    componentDidMount = () => {
        if (this.props.file === undefined) return;
        axios.head("https://web-synk.azurewebsites.net/file/hasthumb/" + this.props.file.filename)
            .then((res) => this.setState({ exists: res.status === 200 }))
    }

    renderWithoutThumb(file) {
        let iconData = renderFileIcon(fileType(file.originalName).toLowerCase(), -1, true);
        let big = this.props.big ? "big" : "";
        return (
            <a href={"https://web-synk.azurewebsites.net/file/render/" + file.filename} rel="noopener noreferrer" target="_blank" className={`image-wrapper ${big}`}>
                <div className="image-overlay">
                    <div className="video-info">
                        <div className="video-info-text">
                            <p className={`video-name ${big === "big" ? "medium" : "tiny"}`}>{file.originalName}</p>
                            <p className={`video-subtext ${big === "big" ? "medium" : "tiny"}`}>{moment(file.createdAt).fromNow()}</p>
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

    renderWithThumb = (file) => {
        let big = this.props.big ? "big" : "";
        return (
            <a onClick={() => this.props.image ? this.props.cb : window.open("https://web-synk.azurewebsites.net/file/render/" + file.filename, "_blank")} className={`image-wrapper ${big}`}>
                <div className="image-overlay">
                    <div className="video-info">
                        <div className="video-info-text">
                            <p className={`video-name ${big === "big" ? "medium" : "tiny"}`}>{file.originalName}</p>
                            <p className={`video-subtext ${big === "big" ? "medium" : "tiny"}`}>{moment(file.createdAt).fromNow()}</p>
                        </div>
                    </div>
                </div>
                <img src={"https://web-synk.azurewebsites.net/file/thumb/" + file.filename} />
                <span className="video-time">{fileType(file.originalName).toUpperCase()}</span>
            </a>
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


    renderFirst = (arr = [0, 1, 2]) => {
        return (
            <div className="content-section-line mv">
                <div className="section-part">
                    <FilePreview file={this.state.files[arr[0]]} big image={this.props.typeSelected === "Images"} />
                </div>

                <div className="section-part">
                    <div className="content-part-line">
                        <FilePreview file={this.state.files[arr[1]]} image={this.props.typeSelected === "Images"} />
                        <FilePreview file={this.state.files[arr[2]]} image={this.props.typeSelected === "Images"} />
                    </div>
                </div>
            </div>
        )
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
                            href={"https://web-synk.azurewebsites.net/file/render/" + temp.filename} target="_blank" rel="noopener noreferrer" style={{ width: "100%", maxHeight: "80vh" }}>
                            {this.state.isShown && <div className="image-overlay prev">
                                <div className="video-info">
                                    <div className="video-info-text">
                                        <p className="video-name medium">{temp.originalName}</p>
                                        <p className="video-subtext medium">{moment(temp.createdAt).fromNow()}</p>
                                    </div>
                                    {/* <button className="btn-play"></button> */}
                                </div>
                            </div>}
                            <img src={"https://web-synk.azurewebsites.net/file/render/" + temp.filename} className="imagepreview" style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}>
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
        var len = this.state.files?.length ?? 0, arr = [];
        if (len === 0) return null;
        for (let i = image ? 3 : 0; i < len; i += 4)
            arr.push(i);

        return (
            <>
                {image && this.renderImagePreview()}
                {image && this.renderFirst()}
                {arr.map((value, index) =>
                    <div key={index} className="content-section-line mv">
                        <div className="section-part">
                            <div className="content-part-line">
                                <FilePreview file={files[index]} image={image} cb={() => image && this.setState({ showPreview: index })} />
                                <FilePreview file={files[index + 1]} image={image} cb={() => image && this.setState({ showPreview: index + 1 })} />
                            </div>
                        </div>
                        <div className="section-part">
                            <div className="content-part-line">
                                <FilePreview file={files[index + 2]} image={image} cb={() => image && this.setState({ showPreview: index + 2 })} />
                                <FilePreview file={files[index + 3]} image={image} cb={() => image && this.setState({ showPreview: index + 3 })} />
                            </div>
                        </div>
                    </div>
                )}
            </>
        )
        // return null;
    }

}

export default Quick;
export { FilePreview };
