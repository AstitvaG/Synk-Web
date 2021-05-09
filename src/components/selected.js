/* eslint-disable */
import React, { Component } from 'react';
import { fileType, renderFileIcon } from '../utils/common';
import * as Thumb from '../utils/thumb'


export default class Selected extends Component {
    constructor(props) {
        super(props);
        this.state = {
            thumb: "",
            hover: false,
        };
    }


    componentDidMount = async () => {
        if (!this.props.file) return;
        this.setState({ thumb: await Thumb.getThumb(this.props.file) });
    }

    componentDidUpdate = async (prvProps, prvState) => {
        if (!this.props.file) return;
        if (this.props.file.name != prvProps.file.name) {
            this.setState({ thumb: await Thumb.getThumb(this.props.file) });
        }
    }

    renderWithoutThumb(file) {
        let iconData = renderFileIcon(fileType(file.name).toLowerCase(), -1, true);
        return (
            <a onClick={this.props.cb} className={`image-wrapper notrans mx-3`}
                onMouseEnter={() => this.setState({ hover: true })}
                onMouseLeave={() => this.setState({ hover: false })}>
                <div className="image-overlay selected-x">
                    <div className="video-info">
                        <div className="video-info-text">
                            <p className={`video-name tiny`}>{file.name.split('.').slice(0, -1).join('.')}</p>
                            <p className={`video-subtext tiny`}>{this.fileSize(file.size)}</p>
                        </div>
                    </div>
                </div>
                <div style={{ backgroundColor: iconData[0], width: "100%", height: "100%", justifyContent: "center", alignItems: "center", display: "flex" }}>
                    <i className={`${this.state.hover ? "las la-times" : iconData[1]} image-icon`} style={{ fontSize: (150 * 1.33 / 40) + "em", color: "white", zIndex: 2 }}></i>
                </div>
                <span className="video-time">{fileType(file.name).toUpperCase()}</span>
            </a >
        )
    }

    renderWithThumb = (file) => {
        return (
            <a onClick={this.props.cb} className={`image-wrapper notrans mx-3`}
                onMouseEnter={() => this.setState({ hover: true })}
                onMouseLeave={() => this.setState({ hover: false })}>
                <div className="image-overlay selected-x">
                    <div className="video-info">
                        <div className="video-info-text">
                            <p className={`video-name tiny`}>{file.name.split('.').slice(0, -1).join('.')}</p>
                            <p className={`video-subtext tiny`}>{this.fileSize(file.size)}</p>
                        </div>
                    </div>
                </div>
                <img src={this.state.thumb} alt={file.name} onError={_ => this.setState({ exists: false })} />

                {this.state.hover && <div style={{ position: "absolute", width: "100%", height: "100%", justifyContent: "center", alignItems: "center", display: "flex", flexDirection: "column", pointerEvents: "none" }}>
                    <i className="las la-times" style={{ fontSize: (100 * 1.33 / 40) + "em", color: "white", zIndex: 2 }}></i>
                    <p className={`video-subtext medium`} style={{ color: "white", zIndex: 2 }}>Remove File</p>
                </div>}
                <span className="video-time">{fileType(file.name).toUpperCase()}</span>
            </a >
        )
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

    render() {
        let { file } = this.props
        if (file === undefined) return null;
        if (this.state.thumb !== "")
            return this.renderWithThumb(file);
        else
            return this.renderWithoutThumb(file);
    }
}
