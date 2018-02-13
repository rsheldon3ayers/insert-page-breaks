const fs = require("fs");
const cheerio = require('cheerio');
const path = require('path');
let checkWord = require('check-word'),
    words = checkWord('en');

let files = fs.readdirSync("sanitized")

const isDirectory = source => fs.lstatSync(source).isDirectory()
const getDirectories = source =>
  fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory)
let html;
let isbn = getDirectories("pdfs")

  isbn.forEach(i => {
    files = fs.readdirSync(`${i}/sanitized`);
    let firstSentences = []
    let fileName = []
    let pageNum = []
    files.forEach(file => {
        let html = fs.readFileSync(`${i}/` + "sanitized/" + file, 'utf-8')
        parseSentence(html, file, firstSentences, fileName, pageNum, `${i}/`)

    })
})

function parseSentence(html, name, firstSentences, fileName, pageNum, dir) {

    // let lines = html.split('\n');

    // lines.splice(0,1)
    // html = lines.join('\n')

    const $ = cheerio.load(html, {
        xmlMode: true,
        decodeEntities: false
    });

    let wordFound = false
        $('p').each(function () {
            console.log(`Working on ${dir}, ${name}`)
            let isAWord = 0;
            let sentences = $(this).text().split(' ')
            sentences.forEach(w => {
                if (words.check(_(w.toLowerCase()))) isAWord++
            })
            if (isAWord > sentences.length / 2) {
                if (fileName.indexOf(name) < 0) {

                    let page = /<p>Page-Number (.*?)<\/p>/g;
                    let linkNum = page.exec($.html())
                    if (linkNum && $(this).text().length > 19) {
                        if ($(this).text() != page) {
                            console.log($(this).text().trim(), `<span epub:type=\"pagebreak\" id=\"page${linkNum[1]}\" title=\"${linkNum[1]}\"/>`)
                            firstSentences.push(`${$(this).text().trim()}`);
                            pageNum.push(`<span epub:type=\"pagebreak\" id=\"page${linkNum[1]}\" title=\"${linkNum[1]}\"/>`)
                            fileName.push(`${name}`)
                            return false
                        }
                    }
                }

            }
        })
        fs.writeFileSync(`${dir}/lists/page-num.js`, `pageNumbers: ${JSON.stringify(pageNum)}`)
        fs.writeFileSync(`${dir}/lists/first-sentence.js`, `firstSentences: ${JSON.stringify(firstSentences)}`)

}