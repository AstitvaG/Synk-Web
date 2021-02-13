/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import { getFileType, fileType } from '../utils/common';
import moment from 'moment';

class Quick extends Component {


    constructor(props) {
        super(props);
        this.state = {
            files: [],
        }
    }

    componentDidMount = () => {
        var files = null, selected = this.props.typeSelected, all = this.props.fileList;
        console.log("Mounted",all)
        const chk = (name, type) => {
            if (type[0])
                return type.includes(getFileType(fileType(name)))
            return getFileType(fileType(name)) === type;
        }
        if (selected) {
            if (selected === "Images") files = all.filter((value) => chk(value.filename, 1));
            else if (selected === "Codes") files = all.filter((value) => chk(value.filename, 6));
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
                    {fi!== undefined && <a className="image-wrapper">
                        <div className="image-overlay">
                            <div className="video-info">
                                <div className="video-info-text">
                                    <p className="video-name tiny">{fi.originalName}</p>
                                    <p className="video-subtext tiny">{moment(fi.createdAt).fromNow()}</p>
                                </div>
                            </div>
                        </div>
                        <img src={"https://web.synk.tools/file/render/" + fi.filename} />
                        <span className="video-time">{fileType(fi.originalName).toUpperCase()}</span>
                    </a>}
                    {se !== undefined && <a className="image-wrapper">
                        <div className="image-overlay">
                            <div className="video-info">
                                <div className="video-info-text">
                                    <p className="video-name tiny">{se.originalName}</p>
                                    <p className="video-subtext tiny">{moment(se.createdAt).fromNow()}</p>
                                </div>
                            </div>
                        </div>
                        <img src={"https://web.synk.tools/file/render/" + se.filename} />
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
                    <a className="image-wrapper big">
                        <div className="image-overlay">
                            <div className="video-info">
                                <div className="video-info-text">
                                    <p className="video-name medium">{temp.originalName}</p>
                                    <p className="video-subtext medium">{moment(temp.createdAt).fromNow()}</p>
                                </div>
                                <button className="btn-play"></button>
                            </div>
                        </div>
                        <img src={"https://web.synk.tools/file/render/" + temp.filename} />
                        <span className="video-time">{fileType(temp.originalName).toUpperCase()}</span>
                    </a>
                </div>
                {this.renderTwo(1)}
            </div>
        )
    }

    renderOthers = () => {
        var len = this.state.files.length, arr = [];
        console.log(len);
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


    render() {
        var { files } = this.state;
        return (
            <>
                {files.length > 0 && this.renderFirst()}
                {files.length > 3 && this.renderOthers()}
            </>
        );
    }
}

export default Quick;
