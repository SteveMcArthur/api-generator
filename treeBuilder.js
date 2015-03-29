/*global exports*/

var evReg = new  RegExp(/^\s{0,2}'(\w+)'/);
function getText(line, lineType) {
    var text = "";
    if (lineType === "class") {
        text = line.split(" ")[1].trim();
    } else if (lineType === "inlineClass") {
        text = line.split("=")[1].trim();
    } else if (lineType === "module") {
        text = line.split("=")[1].trim();
     } else if (lineType === "event") {
        var match = evReg.exec(line);
        text = match[1];
    } else {
        text = line.split(":")[0].trim();
    }
    return text;
}

var idPrefix = "";
var id = 0;

function makeLeaf(text, typ, code, comments) {
    var leaf = {
        id: idPrefix + id,
        text: text,
        typ: typ,
        icon: typ,
        comments: comments,
        code: code,
        children: []
    };
    id++;
    return leaf;
}

function createLeaf(item, commentList) {

    var text = getText(item[2], item[1]);
    var typ = item[1];
    var code = null;
    var children = [];
    if (typ === "inlineClass") {
        typ = "class";
    } else if (typ === "inlineMethod") {
        typ = "method";
        code = item[2].split(">")[1].trim();
    } else if (["string", "number", "prop"].indexOf(typ) > -1) {
        code = item[2].split(":")[1].trim();
    } else if (typ === 'event') {
        if(item[2].indexOf('#') > -1){
            comm = item[2].split("#")[1].trim();
            commentList.push(comm);
        }

    } else if (typ === "array") {
        var start = item[2].indexOf("[") + 1;
        var end = item[2].indexOf("]");
        var str = item[2].substr(start, end-start);
        if (str.length > 0) {
            var childs = str.split('\n');
            for (var i = 0; i < childs.length; i++) {
                var entry = children[i].split('#');
                var text2 = entry[0].trim().replace(/'/g, '');
                var comm = (entry[1]) ? entry[1].trim() : '';
                comm = comm.replace('#', '');
                var leaf2 = makeLeaf(text2, 'prop', [], [comm]);
                children.push(leaf2);

            }
        }else {
            code = item[2].split(":")[1].trim();
        }
        typ = 'prop';

    }
    var codeArray = (code) ? [code] : [];
    var leaf = makeLeaf(text, typ, codeArray, commentList);
    leaf.children = children;

    return leaf;
}

/**
CodeList is an array of each line in the source file and its indent
in the form of: [indent,line]
**/
function generate(codeList, outfile, callback, prefix) {
    var indent = 0;
    var line = "";
    var lineType = "";
    var lastType = "";
    idPrefix = prefix;
    id = 0;
    //var fileParent = findParent(outfile);
    var fileParent = {
        text: "Docpad Lib",
        id: "root",
        children: []
    };
    var zero, one, two;
    var lastNode;
    var commentList = [];


    codeList.forEach(function (item) {
        indent = item[0];
        lineType = item[1];
        line = item[2];



        if (lineType === "comment") {
            var comm = line.replace(/#/g, '').trim();
            commentList.push(comm);
        } else {

            if ((lineType === "empty") && (lastType === "comment")) {
                commentList.push("");
            } else if ((lineType === "empty") && (lastType === "code") && (lastNode)) {
                lastNode.code.push("");
            } else if ((lineType === "code") && (lastNode)) {
                lastNode.code.push(line);
            } else if ((lineType !== "code") && (lineType !== "empty") && (lineType !== "module")) {
                //if the line is not code or a comment then
                //it must be a node
                lastNode = createLeaf(item, commentList);
                commentList = [];
                if (indent === 0) {
                    fileParent.children.push(lastNode);
                    zero = lastNode;
                } else if (indent == 1) {
                    zero.children.push(lastNode);
                    one = lastNode;
                } else if (indent == 2) {
                    one.children.push(lastNode);
                    two = lastNode;
                }

            }

        }
        if (lineType !== "empty") {
            lastType = lineType;
        }


    });

    callback(fileParent, outfile);

}


exports.generate = generate;
