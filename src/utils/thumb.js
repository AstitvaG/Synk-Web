var Canvas = require("canvas");
var assert = require("assert").strict;
const mm = require('music-metadata-browser');

// const sharp = require('sharp');
// const { Buffer } = require('buffer');

// exports.genImgThumb = async (input) => {
//     return Buffer.from(await sharp(input)
//         .resize(300, 300)
//         .webp()
//         .toBuffer()).toString('base64')
// }

exports.genAudioThumb = async (buffer) => {
    try {
        const { common } = await mm.parseFile(buffer);
        const cover = mm.selectCover(common.picture);
        if (cover == null) return "";
        return cover.data.toString('base64');
    }
    catch {
        console.log("Error occured in genAudioThumb")
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
        let t = page.getViewport({ scale: 1.0 })
        var viewport = page.getViewport({ scale: 300 / Math.max(t.height, t.width) });
        var canvasFactory = new NodeCanvasFactory();
        var canvasAndContext = canvasFactory.create(viewport.width, viewport.height);
        var renderContext = { canvasContext: canvasAndContext.context, viewport, canvasFactory, };

        var renderTask = page.render(renderContext);
        // console.log("Done page loading")
        await renderTask.promise
        return canvasAndContext.canvas.toBuffer().toString('base64');
    }
    catch (e) {
        console.log("err :", e)
        return "";
    }
}