/*
    ExportDPISafeSVG.jsx
    One-click Illustrator → Fusion 360 correct SVG exporter.
	Author: Tom Stone
	www.tomstone.se

	Date: 2026-06-12

	CHANGELOG:
	v.0.0.1 
	Initial release


*/

#target illustrator

(function () {
    var SCALE = 96.0 / 72.0;
    var SCALE_PERCENT = SCALE * 100.0;

    var srcDoc = null;
    var workDoc = null;
    var outFile = null;

    try {
        if (app.documents.length === 0) {
            alert("No document open.");
            return;
        }

        srcDoc = app.activeDocument;

        var abIndex = srcDoc.artboards.getActiveArtboardIndex();
        var srcAB = srcDoc.artboards[abIndex].artboardRect;

        var oldLeft = srcAB[0];
        var oldTop = srcAB[1];
        var oldRight = srcAB[2];
        var oldBottom = srcAB[3];

        var oldWidthPt = oldRight - oldLeft;
        var oldHeightPt = oldTop - oldBottom;

        var widthMM = pointsToMM(oldWidthPt);
        var heightMM = pointsToMM(oldHeightPt);

        var viewBoxW = oldWidthPt * SCALE;
        var viewBoxH = oldHeightPt * SCALE;

        outFile = File.saveDialog("Save 96-dpi-compatible SVG as", "*.svg");
        if (!outFile) return;

        if (String(outFile).toLowerCase().indexOf(".svg") !== String(outFile).length - 4) {
            outFile = new File(String(outFile) + ".svg");
        }

        srcDoc.activate();
        srcDoc.selection = null;
        srcDoc.artboards.setActiveArtboardIndex(abIndex);

        var ok = srcDoc.selectObjectsOnActiveArtboard();
        if (!ok || srcDoc.selection.length === 0) {
            alert("No selectable artwork found on the active artboard.");
            return;
        }

        app.executeMenuCommand("copy");

        workDoc = app.documents.add(
            srcDoc.documentColorSpace,
            oldWidthPt,
            oldHeightPt
        );

        workDoc.activate();
        workDoc.artboards[0].artboardRect = [0, oldHeightPt, oldWidthPt, 0];

        app.executeMenuCommand("pasteInPlace");

        if (workDoc.selection.length === 0) {
            throw new Error("Paste failed.");
        }

        app.executeMenuCommand("group");

        if (workDoc.selection.length === 0) {
            throw new Error("Could not group pasted artwork.");
        }

        var group = workDoc.selection[0];

        group.resize(
            SCALE_PERCENT,
            SCALE_PERCENT,
            true,
            true,
            true,
            true,
            SCALE_PERCENT,
            Transformation.TOPLEFT
        );

        workDoc.artboards[0].artboardRect = [
            0,
            oldHeightPt * SCALE,
            oldWidthPt * SCALE,
            0
        ];

        var b = group.visibleBounds;

        group.translate(
            -b[0],
            (oldHeightPt * SCALE) - b[1]
        );

        var opts = new ExportOptionsSVG();
        opts.embedRasterImages = true;
        opts.documentEncoding = SVGDocumentEncoding.UTF8;
        opts.coordinatePrecision = 5;
        opts.preserveEditability = false;

        workDoc.exportFile(outFile, ExportType.SVG, opts);

        workDoc.close(SaveOptions.DONOTSAVECHANGES);
        workDoc = null;

        rewriteSVGHeader(outFile, widthMM, heightMM, viewBoxW, viewBoxH);

        srcDoc.activate();
        srcDoc.selection = null;

        alert("SVG exported and corrected.\n \nNow go watch some magicians on YouTube!\n-Tom Stone");

    } catch (e) {
        alert("Error: " + e.message);

    } finally {
        if (workDoc !== null) {
            try {
                workDoc.close(SaveOptions.DONOTSAVECHANGES);
            } catch (ignore) {}
        }

        if (srcDoc !== null) {
            try {
                srcDoc.activate();
            } catch (ignore2) {}
        }
    }

    function pointsToMM(pt) {
        return pt * 25.4 / 72.0;
    }

    function num(n) {
        return String(Math.round(n * 1000000) / 1000000);
    }

    function rewriteSVGHeader(file, widthMM, heightMM, viewBoxW, viewBoxH) {
        file.encoding = "UTF-8";

        if (!file.open("r")) {
            throw new Error("Could not reopen exported SVG for reading.");
        }

        var svg = file.read();
        file.close();

        var svgStart = svg.indexOf("<svg");
        var tagEnd = svg.indexOf(">", svgStart);

        if (svgStart < 0 || tagEnd < 0) {
            throw new Error("Could not find SVG header.");
        }

        var tag = svg.substring(svgStart, tagEnd + 1);

        tag = removeAttribute(tag, "width");
        tag = removeAttribute(tag, "height");
        tag = removeAttribute(tag, "viewBox");

        tag = tag.substring(0, tag.length - 1) +
            ' width="' + num(widthMM) + 'mm"' +
            ' height="' + num(heightMM) + 'mm"' +
            ' viewBox="0 0 ' + num(viewBoxW) + ' ' + num(viewBoxH) + '"' +
            ">";

        svg = svg.substring(0, svgStart) + tag + svg.substring(tagEnd + 1);

        file.encoding = "UTF-8";

        if (!file.open("w")) {
            throw new Error("Could not reopen exported SVG for writing.");
        }

        file.write(svg);
        file.close();
    }

    function removeAttribute(tag, attrName) {
        var re1 = new RegExp("\\s+" + attrName + "\\s*=\\s*\"[^\"]*\"", "i");
        var re2 = new RegExp("\\s+" + attrName + "\\s*=\\s*'[^']*'", "i");

        tag = tag.replace(re1, "");
        tag = tag.replace(re2, "");

        return tag;
    }

})();