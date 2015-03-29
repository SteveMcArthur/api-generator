/*global exports*/

/**
Property Reg
line begins with between 0 or 2 tabs
followed by letters and a colon
**/
var propReg = new RegExp(/^\t{0,2}[a-zA-Z]+:/);

/**
Comment Reg
line begins with between 0, 1 or 2 tabs
followed by a hash (#)
**/
var commReg = new RegExp(/^\t{0,2}#/);

/**
Function Reg
After colon have a space and possibly
brackets containing characters and then
possibly a space and either "->" or "=>"
**/
var fnReg = new RegExp(/^\s*[a-zA-Z]+:\s*(?:\([a-zA-Z\.]+\))?\s*?(?:=|-)>/);

/**
Inline function Reg
Like the Function Reg, but checks
to see if the function body is on the same line
eg: 'module.exports = docpadUtil = '
**/
var inlineFnReg = new RegExp(/^\s*[a-zA-Z]+:\s*(?:\([a-zA-Z\.]+\))?\s*?(?:=|-)>\s*.+/);

/**
Inline Class Reg
Sometimes a module and a class can
be declared at the same time on the same line
**/
var inlineClass = new RegExp(/^module\.exports\s\=\s[a-zA-Z]+\s=/);

/**
Array property Reg
^\s{0,2}\w+:\s*\[('[\w]+'\s*(?:#[\s\w,']*)*\s*)*\]
**/
var arrayPropReg = new RegExp(/^\s{0,2}\w+:\s*\[('[\w]+'\s*(?:#[\s\w,']*)*\s*)*\]/);

/**
Event property Reg
**/
var eventPropReg = new RegExp(/^\s{0,2}events+:\s*\[\s*$/);


var parReg = new RegExp(/\(.+\)/);
var valReg = new RegExp(/:\s\d+[[\*\+\\]?\d+]?/);
var strReg = new RegExp(/:\s['"].*['"]/);

var multiStartReg = new RegExp(/^###/);
var multiEndReg = new RegExp(/###\s?$/);


var indentReg = new RegExp(/^\t{0,5}/);

var multiStringReg = new RegExp(/"""/);


var inEvents = false;
function getPropertyType(line) {


    var fn = fnReg.exec(line);
    var fnInline = inlineFnReg.exec(line);
    var val = valReg.exec(line);
    var str = strReg.exec(line);
    var arr = arrayPropReg.exec(line);
    var events = eventPropReg.exec(line);
    var lineType = "";

    if (fnInline) {
        lineType = "inlineMethod";

    } else if (fn) {
        lineType = "method";

    } else if (val) {
        lineType = "number";

    } else if (str) {
        lineType = "string";
     } else if (arr) {
        lineType = "array";
     } else if (events) {
        lineType = "events";
        inEvents = true;
    } else {
        lineType = "prop";
        /**
        if (prop === "events") {
            eventNode = temp;
        }
        **/

    }
    return lineType;
}

var inMultiLineComment = false;
var inMultiLineString = false;

function getLineType(line) {

    inMultiLineComment = line.match(multiStartReg) ? true : inMultiLineComment;
    inMultiLineString = line.match(multiStringReg) ? true : inMultiLineString;
    var lineType = "";

    if (inMultiLineString) {
        lineType = "code";
    } else if (!inMultiLineComment) {


        if (line.trim().length === 0) {
            lineType = "empty";
        } else if (line.substr(0, 5) === "class") {
            lineType = "class";
        } else if (line.substr(0, 16) == "module.exports =") {
            if (inlineClass.exec(line)) {
                lineType = "inlineClass";
            } else {
                lineType = "module";
            }
        } else if (propReg.exec(line)) {
            lineType = getPropertyType(line);
        } else if (commReg.exec(line)) {
            lineType = "comment";
        } else if (inEvents) {
            if(line.indexOf("]") > -1){
                inEvents = false;
                lineType = "empty";
            }else {
                lineType = "event";
            }
        } else {
            lineType = "code";
        }

    } else {
        //I think this is redundant
        lineType = "comment";
    }

    inMultiLineComment = line.match(multiEndReg) ? false : inMultiLineComment;
    inMultiLineString = line.match(multiStringReg) ? false : inMultiLineString;
    return lineType;
}

function parseLine(line) {

    var match = line.match(indentReg);
    var indent = match[0].length;
    var lineType = getLineType(line);

    return [indent, lineType, line];

}

exports.parseLine = parseLine;
