const fs = require("fs");
const fse = require('fs-extra')
const path = require("path")
const cheerio = require('cheerio');

let pdf;

const isDirectory = source => fs.lstatSync(source).isDirectory()
const getDirectories = source =>
  fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory)
let html;
let isbn = getDirectories("pdfs")

  isbn.forEach(i => {
    pdf = `${i}`
    files = fs.readdirSync(`${i}/out`);

    files.forEach(file => {

        if(path.extname(file) == ".html")html = fs.readFileSync(`${i}/` + "out/" + file, 'utf-8')
        if(path.extname(file) == ".html") sanitizeHTMl(html, file, i)

    })
})
function sanitizeHTMl(html, file, dir) {


    const $ = cheerio.load(html, {
        xmlMode: true,
        decodeEntities: false
    });

    $('span').each(function () {
        $(this).replaceWith($(this).html());
        $.html()
    })
    $('span').each(function () {
        $(this).replaceWith($(this).html());
        $.html()
    })
    $('span').each(function () {
        $(this).replaceWith($(this).html());
        $.html()
    })
    $('span').each(function () {
        $(this).replaceWith($(this).html());
        $.html()
    })
    $('span').each(function () {
        $(this).replaceWith($(this).html());
        $.html()
    })
    $('span').each(function () {
        $(this).replaceWith($(this).html());
        $.html()
    })
    $('div').filter(function () {
        if ($(this).attr('class') === 'pi') $(this).remove();
        $.html()
    }).attr('class')
    $('img').each(function () {
        $(this).remove();
        $.html()
    })
    $('div').each(function () {
        if ($(this).has($('div'))) $(this).replaceWith($(this).html())
        $.html()
    })
    $('div').each(function () {

        if ($(this).html().indexOf('div') > -1) $(this).replaceWith($(this).html())
        $.html()
    })
    $('div').each(function () {
        if ($(this).html().indexOf('div') > -1) $(this).replaceWith($(this).html())
        $.html()
    })
    $('div').each(function () {
        if ($(this).html().indexOf('div') > -1) $(this).replaceWith($(this).html())
        $.html()
    })
    $('div').each(function () {
        if (!$(this).html()) {
            $(this).replaceWith($(this).html())
        }
        $.html()
    })
    $('div').each(function () {
        $(this).removeAttr('class').html()
    })


    let html2 = $.html()
    let newHTML = html2.replace(/<div>/gi, '<p>')

    newHTML = newHTML.replace(/<\/div>/gi, '</p>')

    fs.writeFileSync(`${dir}/sanitized/${file}`,newHTML)

}
fse.emptyDirSync(`${pdf}/out`)
