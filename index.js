"use strict";
const path = require('path');
const fs = require("fs");
let escapeRegExp = require('lodash.escaperegexp');
const cheerio = require('cheerio');
let natural = require('natural');
const list = require("./lib/unfoldList");
let dir = './lib/project'
const lib = path.resolve('./', 'lib');
const project = path.resolve(lib, 'project');

let files = fs.readdirSync(project)

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

        $('span,p,h\d+').filter(function () {

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

        let nodeString = [];
        if (pageBreakLoc.html().indexOf(`${list.pageNumbers[pageNumIndex]}`) > -1) {
            return;
        } else {
            let nodeString = [];
            if (finalNode.data.indexOf(testString) > -1) {
                nodeString = [finalNode.data.slice(0, finalNode.data.indexOf(testString)), ` ${list.pageNumbers[pageNumIndex]}`, finalNode.data.slice(finalNode.data.indexOf(testString))].join('')
                finalNode.data = nodeString;
            } else if (testString.indexOf(finalNode.data) > -1) {

                let finalString = [pageBreakLoc.html().slice(0, pageIndex), ` ${list.pageNumbers[pageNumIndex]}`, pageBreakLoc.html().slice(pageIndex)].join('');

                pageBreakLoc.html(finalString);
            } else {

                if (pageBreakLoc.html().match(formatStrings(testString)) > -1) {

                    let finalString = [pageBreakLoc.html().slice(0, pageIndex), ` ${list.pageNumbers[pageNumIndex]}`, pageBreakLoc.html().slice(pageIndex)].join('');

                    pageBreakLoc.html(finalString);

                }
            }
        }
        let newHTML = $.html();

        fs.writeFileSync(`./lib/project/${fileName}`, newHTML, {
            encoding: 'utf8'
        });
    }


    function formatStrings(str) {
        str = str.replace(/(\(|\?|\)|\“|\”|~|`|\[|\]|!|@|#|\$|%|\^|–|&|\*|\(|\)|\)|\{|\}|\[|\]|;|:|\"|’|<|,|\.|>|\?|\/|\\|\||-|_|\+|=)/g, "")

        return str;
    }
}