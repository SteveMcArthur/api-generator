/*global require, process, exports*/
var path = require('path');
var bldr = require('./docBuilder.js');

var files1 = ["base.coffee", "docpad.coffee", "plugin.coffee", "plugin-loader.coffee", "testers.coffee", "util.coffee"];
var files2 = ["models/document.coffee","models/file.coffee"];
var fileList = files1.concat(files2);

var dir = path.join('source-docs', 'lib');
var dirOut = 'docs';
bldr.loadFiles(fileList,dir,dirOut);
