import React from 'react';
import moment from 'moment';
/* eslint-disable */

// return the user data from the session storage
export const getUser = () => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    else return null;
}

// return the token from the session storage
export const getToken = () => {
    return sessionStorage.getItem('token') || null;
}

// remove the token and user from the session storage
export const removeUserSession = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
}

// set the token and user from the session storage
export const setUserSession = (token, user) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
}


export const parseDate = (dateString) => {
    var today = moment();
    var yesterday = moment().subtract(1, 'day');
    var engagementDate = new Date(dateString);
    if (moment(engagementDate).isSame(today, 'day'))
        return 'Today, ' + moment(dateString).format("Do MMMM yyyy")
    else if (moment(engagementDate).isSame(yesterday, 'day'))
        return 'Yesterday, ' + moment(dateString).format("Do MMMM yyyy")
    return moment(dateString).format("dddd, Do MMMM yyyy")
}

export const getFileType = (ext) => {
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'png', 'webp', 'svg'].includes(ext)) return 1
    else if (['pdf'].includes(ext)) return 2
    else if (['doc', 'docx'].includes(ext)) return 3
    else if (['xls', 'xlsx'].includes(ext)) return 4
    else if (['ppt', 'pptx'].includes(ext)) return 5
    else if (['sh', 'tex', 'py', 'java', 'c', 'cpp', 'js', 'html', 'css', 'erl', 'json'].includes(ext)) return 6
    else if (['webm', 'mpg', 'mp2', 'mpeg', 'mpe', 'mpv', 'ogg', 'mp4', 'm4p', 'm4v', 'avi', 'wmv', 'mov', 'qt', 'flv', 'swf', 'avchd'].includes(ext)) return 7
    else if (['m4a', 'flac', 'mp3', 'wav', 'wma', 'aac'].includes(ext)) return 12
    else if (ext === "close-icon") return 8
    else if (ext === "Website") return 9
    else if (ext === "Android" || ext === "apk") return 10
    else if (ext === "iOS") return 11
    else if (['msi', 'exe', 'bat'].includes(ext)) return 13
    else if (['deb', 'rpm', 'appimage', 'dmg'].includes(ext)) return 14
    else return 0
}

export const renderFileIcon = (ext, size = 40, justData = false) => {
    var col, ico
    switch (getFileType(ext)) {
        case 0:
            col = '#555555', ico = "lar la-file-archive"
            break
        case 1:
            col = '#C13584', ico = "lar la-file-image"
            break
        case 2:
            col = '#ff0000', ico = "lar la-file-pdf"
            break
        case 3:
            col = '#2a5492', ico = "lar la-file-word"
            break
        case 4:
            col = '#247c3f', ico = "lar la-file-excel"
            break
        case 5:
            col = '#cd4f2f', ico = "lar la-file-powerpoint"
            break
        case 6:
            col = '#7c007c', ico = "lar la-file-code"
            break
        case 7:
            col = '#f7c639', ico = "lar la-file-video"
            break
        case 8:
            col = '#22244a', ico = "las la-times"
            break
        case 9:
            col = '#dd4b25', ico = "las la-code"
            break
        case 10:
            col = '#30dd81', ico = "lab la-android"
            break
        case 11:
            col = '#000000', ico = "lab la-apple"
            break
        case 12:
            col = '#1DB954', ico = "lar la-file-audio"
            break
        case 13:
            col = '#0078D7', ico = "fab fa-windows"
            break
        case 14:
            col = '#dd4814', ico = "lab la-ubuntu"
            break
        default:
            col = '#555555', ico = "lar la-file-archive"
    }
    if (justData) {
        return [col, ico];
    }
    return (
        <div className="btn-circle" style={{ color: "#fff", background: col, width: size + "px", height: size + "px" }}>
            <i className={ico + " m-auto"} style={{ fontSize: (size * 1.33 / 40) + "em" }}></i>
        </div>
    )
}

export const fileType = (fileName) => {
    var val = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length);
    return val.length < 10 ? val : ""
}

// export const baseUrl = "https://web-synk.azurewebsites.net"
export const baseUrl = "http://localhost:7000"