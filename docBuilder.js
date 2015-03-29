/*global require, process, exports*/
var fs = require('fs');
var readline = require('readline');
var path = require('path');
var builder = require('./treeBuilder');
var parser = require('./lineParser');


var chrcode = 65;
var sourceDir;
var outDir;

/**
Read file in line by line and add each line to
an array and pass to the builder
**/
function readFile(fileIn, callback) {
    var codeList = [];
    var ns = path.basename(fileIn,".coffee");
    var fileOut = ns + "-doc.json";
    var filePathIn = path.join(sourceDir, fileIn);
    console.log(filePathIn);
    var rd = readline.createInterface({
        input: fs.createReadStream(filePathIn),
        output: process.stdout,
        terminal: false
    });

    rd.on('close', function () {
        var mapfile = path.join(outDir, ns + '-map.txt');

        try {
            fs.unlinkSync(mapfile);
        }
        catch(err){}

        for (var i = 0; i < codeList.length; i++) {
            fs.appendFileSync(mapfile, codeList[i].join("|") + "\r\n");
        }
        builder.generate(codeList, fileOut, callback, String.fromCharCode(chrcode));
        chrcode++;
    });

    var parseLine = parser.parseLine;
    rd.on('line', function (line) {
        var parsed = parseLine(line);
        codeList.push(parsed);
    });

}

var i = 0;
var fileList;

function doFile(result, fileOut) {
    if ((result) && (fileOut)) {
        var txt = JSON.stringify(result);
        fileOut = path.join(outDir, fileOut);
        console.log("Writing file " + fileOut);
        fs.writeFile(fileOut, txt);
    }
    if (i < fileList.length) {
        readFile(fileList[i], doFile);
        i++;
    }
}

function loadFiles(files,dir,dirOut) {
    sourceDir = dir;
    outDir = dirOut;
    if (files) {
        fileList = files;
    }
    doFile();
}


exports.loadFiles = loadFiles;
