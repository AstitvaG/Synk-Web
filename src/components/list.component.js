import React, { Component } from 'react';
// import './style.scss';
import axios from 'axios';


export default class ListState extends Component {
    constructor(props) {
        super(props);

        this.state = {
            imageList: [],
        };
    }

    componentDidMount = () => {
        axios.get('https://web.synk.tools/file/')
            .then(response => {
                this.setState({ imageList: response.data.files });
                console.log(this.state.imageList)
            })
            .catch(err => alert(err));
    }

    deleteFile = (id) => {
        axios.get('https://web.synk.tools/file/delete/' + id) 
            .then((response) => {
                if (response.data.success) {
                    alert('File with ID: ' + id + ' has been deleted');
                    this.setState({ imageList: this.state.imageList.filter(el => el._id !== id)});
                }
            })
            .catch(err => alert(err));
    }

    render() {
        return (
            <div className="ListPage">
                <p className="ListPage__Title">List of Files/Images</p>
                <div className="ListImageContainer">
                    {this.state.imageList.map((file) => (
                        <div className="ListImage">
                            <p className="ListImage__Caption">{file.caption}</p>
                            <p className="ListImage__Date">{file.createdAt}</p>
                            <img
                                src={'https://web.synk.tools/file/render/' + file.filename}
                                alt="list-image"
                                className="ListImage__Image"
                            />

                            <button className="ListImage__Delete" onClick={() => this.deleteFile(file._id)}>Delete</button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}