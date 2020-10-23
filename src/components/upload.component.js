import React, { Component } from 'react';
import axios from 'axios';
import './upload.component.css';


export default class Upload extends Component {

    constructor(props) {
        super(props);

        this.state = {
            senderId: localStorage.getItem('userId'),
            recieverName: '',
            recentFile: {},
            caption: '',
            uploadedFileUrl: '',
            uploadedFile: {},
            userOs: localStorage.getItem('userOs'),
        };
    }

    componentDidMount = () => {
        this.fetchRecent()
    }

    fetchRecent = () => {
        axios.get('https://web.synk.tools/file/recent/1')
        .then((response) => {
                this.setState({ recentFile: response.data.files[0]});
                console.log("here",this.state.recentFile.filename)
            })
            .catch(err => alert('Error: ' + err));
    }

    uploadFile = () => {
        if (!this.state.caption.trim() || !this.state.uploadedFile.name || !this.state.recieverName) {
            return alert('Caption or file or recieverName is missing');
        }

        let formData = new FormData();
        formData.append('caption', this.state.caption);
        formData.append('file', this.state.uploadedFile);
        formData.append('recieverName', this.state.recieverName);
        formData.append('senderId', this.state.senderId);

        axios.post('https://web.synk.tools/file/', formData)
            .then((response) => {
                response.data.success ? alert('File successfully uploaded') : alert('File already exists');
                this.fetchRecent();
            })
            .catch(err => alert('Error: ' + err));
    }

    render() {
        return (
            <div className="UploadPage">
                <div className="Recent">
                    <p className="Recent__Title">Recently uploaded file</p>
                    {
                        this.state.recentFile?
                        <div className="FileBox">
                            <div className="CaptionBox">
                                <p className="FileBox__Caption">Reciever Name</p>
                                <span className="FileBox__CaptionValue">{this.state.recentFile.recieverName}</span>
                            </div>
                            <div className="CaptionBox">
                                <p className="FileBox__Caption">Caption</p>
                                <span className="FileBox__CaptionValue">{this.state.recentFile.caption}</span>
                            </div>
                            <div className="CaptionBox">
                                <p className="FileBox__Caption">Name</p>
                                <span className="FileBox__CaptionValue">{this.state.recentFile.originalName}</span>
                            </div>
                            <img
                                src={'https://web.synk.tools/file/render/' + this.state.recentFile.filename}
                                alt="recent-image"
                                className="Recent__Image"
                                />
                        </div>:""
                    }
                </div>

                <div className="Upload">
                    <p className="Upload__Title">Upload File</p>
                    <div className="Upload__InputSection">
                        <input
                            type="text"
                            className="Upload__Caption"
                            placeholder="SenderId"
                            value={localStorage.getItem('userId')}
                        />
                        <input
                            type="text"
                            className="Upload__Caption"
                            placeholder="Receiver Name"
                            onChange={event => this.setState({ recieverName: event.target.value })}
                            value={this.state.recieverName}
                        />
                        <input
                            type="text"
                            className="Upload__Caption"
                            placeholder="Enter caption..."
                            onChange={event => this.setState({ caption: event.target.value })}
                            value={this.state.caption}
                        />
                        <input
                            type="file"
                            className="Upload__Input"
                            onChange={(event) => {
                                this.setState({
                                    uploadedFileUrl: URL.createObjectURL(event.target.files[0]),
                                    uploadedFile: event.target.files[0],
                                })
                            }}
                        />
                    </div>

                    <img
                        src={!this.state.uploadedFileUrl.trim() ? "" : this.state.uploadedFileUrl}
                        alt="upload-image"
                        className="Upload__Image"
                    />

                    <button onClick={this.uploadFile} className="Upload__Button">Upload</button>
                </div>
            </div>
        );
    }
}