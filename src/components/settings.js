import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { baseUrl } from '../utils/common';

export default function SettingsModal(props) {
    let [devices, setDevices] = useState([]);

    useEffect(() => {
        axios.post(`${baseUrl}/device/`, { username: props.user.username })
            .then(res => {
                setDevices(res.data.devices);
            })
            .catch(err => alert(err));
    }, [props.user.username])

    if (!props.user) return null;
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
                <p className="my-0" style={{color: '#555555'}}>Username</p>
                <h5><b>{props.user.username}</b></h5>
                <p className="my-0" style={{color: '#555555'}}>Email</p>
                <h5><b>{props.user.email}</b>{"  "}{props.user.verified && <i style={{ color: 'blue' }} class="las la-check-circle" />}</h5>
                <hr />
                <h4>Device Settings</h4>
                {andr.length > 0 && <div>
                    <p className="my-0" style={{color: '#555555'}}>Android Devices</p>
                    {andr.map((device, key) => <h6 key={"android-" + key}><b>{device.name}</b></h6>)}
                    <br />
                </div>}
                {ios.length > 0 && <div>
                    <p className="my-0" style={{color: '#555555'}}>iOS Devices</p>
                    {ios.map((device, key) => <h6 key={"ios-" + key}><b>{device.name}</b></h6>)}
                    <br />
                </div>}
                {web.length > 0 && <div>
                    <p className="my-0" style={{color: '#555555'}}>Web Devices</p>
                    {web.map((device, key) => <h6 key={"web-" + key}><b>{device.name}</b></h6>)}
                    <br />
                </div>}
            </Modal.Body>
        </Modal>
    );
}
