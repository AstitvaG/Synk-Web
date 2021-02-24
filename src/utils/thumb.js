// import { getFileType } from './common'

var Canvas = require("canvas");
var assert = require("assert").strict;
const mm = require('music-metadata-browser');
var common = require('../utils/common')

// const sharp = require('sharp');
const { Buffer } = require('buffer');

// exports.genImgThumb = async (input) => {
//     return Buffer.from(await sharp(input)
//         .resize(300, 300)
//         .webp()
//         .toBuffer()).toString('base64')
// }

const convert = (buffer, type = 'image/jpeg') => {
    return `data:${type};base64,${Buffer.from(buffer).toString('base64')}`;
}

exports.getThumb = async (file) => {
    let ftype = common.getFileType(common.fileType(file.name));
    if (![1, 2, 12].includes(ftype)) return "";
    let buffer = await new Promise((resolve, reject) => {

        let reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    })
    if (ftype === 1)
        return convert(buffer, file.type);
    else if (ftype === 2)
        return await this.genPdfThumb(buffer);
    else if (ftype === 12)
        return await this.genAudioThumb(buffer);
}

exports.genAudioThumb = async (buffer) => {
    try {
        const { common } = await mm.parseBlob(new Blob([buffer]));
        const cover = mm.selectCover(common.picture);
        if (cover == null) return "";
        return convert(cover.data, cover.format);
    }
    catch (e) {
        console.log("Error occured in genAudioThumb", e)
        return ""
    }
}

function NodeCanvasFactory() { }
NodeCanvasFactory.prototype = {
    create: function NodeCanvasFactory_create(width, height) {
        assert(width > 0 && height > 0, "Invalid canvas size");
        var canvas = Canvas.createCanvas(width, height);
        var context = canvas.getContext("2d");
        return {
            canvas,
            context,
        };
    },

    reset: function NodeCanvasFactory_reset(canvasAndContext, width, height) {
        assert(canvasAndContext.canvas, "Canvas is not specified");
        assert(width > 0 && height > 0, "Invalid canvas size");
        canvasAndContext.canvas.width = width;
        canvasAndContext.canvas.height = height;
    },

    destroy: function NodeCanvasFactory_destroy(canvasAndContext) {
        assert(canvasAndContext.canvas, "Canvas is not specified");
        canvasAndContext.canvas.width = 0;
        canvasAndContext.canvas.height = 0;
        canvasAndContext.canvas = null;
        canvasAndContext.context = null;
    },
};

var pdfjsLib = require("pdfjs-dist/es5/build/pdf.js");
var pdfjsWorker = require("pdfjs-dist/es5/build/pdf.worker.entry");
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Some PDFs need external cmaps.
var CMAP_URL = "../node_modules/pdfjs-dist/cmaps/";
var CMAP_PACKED = true;

exports.genPdfThumb = async (pdfBuffer) => {
    try {
        var loadingTask = pdfjsLib.getDocument({
            data: pdfBuffer,
            cMapUrl: CMAP_URL,
            cMapPacked: CMAP_PACKED,
        });

        const pdfDocument = await loadingTask.promise;

        const page = await pdfDocument.getPage(1);
        var viewport = page.getViewport({ scale: 1.0 });
        var canvasFactory = new NodeCanvasFactory();
        var canvasAndContext = canvasFactory.create(viewport.width, viewport.height);
        var renderContext = { canvasContext: canvasAndContext.context, viewport, canvasFactory, };

        var renderTask = page.render(renderContext);
        // console.log("Done page loading")
        await renderTask.promise
        return canvasAndContext.canvas.toDataURL('image/png');
    }
    catch (e) {
        console.log("err :", e)
        return "";
    }
}