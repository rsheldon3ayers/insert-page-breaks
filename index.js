"use strict";
const path = require('path');
const fs = require("fs");
const fse = require('fs-extra')
const cheerio = require('cheerio');
const natural = require('natural');
const list = require("./lib/unfoldList");
const lib = path.resolve('./', 'lib');
const project = path.resolve(lib, 'project');
let isbn = '9781535922791'
let pdf = `./pdfs/${isbn}/`
let dir = `../../EPUB Projects/DefenseDoctrine/dev/epub/${isbn}/OEBPS/text`

const isDirectory = source => fs.lstatSync(source).isDirectory()
const getDirectories = source =>
    fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory)
let html;
let files = fs.readdirSync(dir)

files.forEach(file => {
    let html = fs.readFileSync(path.join(dir, file), 'utf-8')
    if (html) insertPageBreaks(html, file)
});

function insertPageBreaks(html, fileName) {

    const $ = cheerio.load(html, {
        xmlMode: true,
        decodeEntities: false
    });

    let highestScore = 0;
    let finalNode;

    list.firstSentences.forEach((testString) => {

        $('span,p,h\d+,li').filter(function () {

            if (formatStrings($(this).text()).match(new RegExp(formatStrings(testString), "gi"))) {

                writePageBreak($(this), testString);

            } else return;

        })
    })

    function writePageBreak(pageBreakLoc, testString) {

        let isAtextNode = 3;

        let textNodes = pageBreakLoc.contents().filter(function () {

            return this.nodeType == isAtextNode;
        });

        let contentsOfTextNodes = [];

        textNodes.each((index, node) => {

            contentsOfTextNodes[index] = node.data;
        })

        contentsOfTextNodes.forEach((str, i, item) => {

            if (item.toString().length <= testString.length) {

                if (formatStrings(testString).match(new RegExp(formatStrings(item.toString()), "gi"))) {

                    getScore(natural.JaroWinklerDistance(testString, item.toString()), textNodes[i])
                    highestScore = natural.JaroWinklerDistance(testString, item.toString())
                }
            } else if (item.toString().length >= testString.length) {

                if (formatStrings(item.toString()).match(new RegExp(formatStrings(testString), "gi"))) {
                    getScore(natural.JaroWinklerDistance(testString, item.toString()), textNodes[i])
                    highestScore = natural.JaroWinklerDistance(testString, item.toString())
                }
            } else return;
        })
        if (finalNode) writeResults(finalNode, highestScore, testString, pageBreakLoc)
    }


    function getScore(score, node) {
        highestScore < score ? finalNode = node : finalNode = finalNode;
    }

    function writeResults(i, results, testString, pageBreakLoc) {

        let pageNumIndex = list.firstSentences.indexOf(testString);
        let pageIndex = pageBreakLoc.html().indexOf(testString);
        let placeNum = `${list.pageNumbers[pageNumIndex]}`;
        let nodeString = [];
        if (pageBreakLoc.html().indexOf(`${placeNum}`) > -1) {
            console.log(pageBreakLoc.html().indexOf(`${placeNum}`), `${fileName}`)
            return false;
        } else {
            console.log(`placing into ${fileName}`)
            let nodeString = [];

            if (finalNode.data.indexOf(testString) > -1) {
                nodeString = [finalNode.data.slice(0, finalNode.data.indexOf(testString)), ` ${placeNum}`, finalNode.data.slice(finalNode.data.indexOf(testString))].join('')
                finalNode.data = nodeString;
            } else if (testString.indexOf(finalNode.data) > -1) {

                let finalString = [pageBreakLoc.html().slice(0, pageIndex), ` ${placeNum}`, pageBreakLoc.html().slice(pageIndex)].join('');

                pageBreakLoc.html(finalString);
            } else {

                if (pageBreakLoc.html().match(formatStrings(testString)) > -1) {

                    let finalString = [pageBreakLoc.html().slice(0, pageIndex), `${placeNum}`, pageBreakLoc.html().slice(pageIndex)].join('');

                    pageBreakLoc.html(finalString);

                }
            }
        }

        let newHTML = $.html();

        fs.writeFileSync(`${pdf}/finish/${fileName}`, newHTML, {
            encoding: 'utf8'
        });
    }


    function formatStrings(str) {
        str = str.replace(/(\(|\?|\)|\“|\”|~|`|\[|\]|!|@|#|\$|%|\^|–|&|\*|\(|\)|\)|\{|\}|\[|\]|;|:|\"|’|<|,|\.|>|\?|\/|\\|\||-|_|\+|=|\s)/g, "")

        return str;
    }
}
fse.emptyDir('./sanitized')