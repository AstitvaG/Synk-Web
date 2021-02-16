import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';

export default function SettingsModal(props) {
    let [devices, setDevices] = useState([]);

    useEffect(() => {
        axios.post('http://localhost:7000/device/', { username: props.user.username })
            .then(res => {
                setDevices(res.data.devices);
            })
            .catch(err => alert(err));
    }, [props.user.username])

    let andr = devices.filter((val) => val.platform === 1)
    let ios = devices.filter((val) => val.platform === 3)
    let web = devices.filter((val) => val.platform === 2)


    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Settings
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h4>Account Settings</h4>
                Username
                <h5><b>{props.user.username}</b></h5>
                Email
                <h5><b>{props.user.email}</b></h5>
                <hr />
                <h4>Device Settings</h4>
                {andr.length > 0 && <div>
                    Android Devices
                    {andr.map((device, key) => <h6 key={"android-" + key}><b>{device.name}</b></h6>)}
                    <br />
                </div>}
                {andr.length > 0 && <div>
                    Web Devices
                    {web.map((device, key) => <h6 key={"web-" + key}><b>{device.name}</b></h6>)}
                    <br />
                </div>}
                {ios.length > 0 && <div>
                    Android Devices
                    {ios.map((device, key) => <h6 key={"ios-" + key}><b>{device.name}</b></h6>)}
                    <br />
                </div>}
            </Modal.Body>
        </Modal>
    );
}
