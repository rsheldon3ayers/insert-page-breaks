const fs = require("fs");
const _ = require('lodash.escaperegexp')
const he = require('he')
let parse = require('himalaya').parse
const toHTML = require('himalaya/translate').toHTML

let files = fs.readdirSync("out")

files.forEach(file => {
    let html = fs.readFileSync("out/" + file, 'utf-8')
    sanitizeHTMl(html, file)

})



function sanitizeHTMl(html, file) {


    const json = parse(prepHTML(html))


    let ol = {
        "type": "element",
        "tagName": "ol",
        "attributes" :[
            {
                "key": "class",
                "value":
                "digit"
            }
        ]
    }

    let htmlKids =[];
    let bodyKids =[]
    json.forEach(el => {

        if(el.tagName == "?xml")
        {
            el.children.forEach(kid1=>{

                kid1.tagName == "html" ? htmlKids = kid1.children : htmlKids = htmlKids
                kid1.tagName == "body" ? bodyKids = kid1.children : bodyKids = bodyKids
                console.log(bodyKids)
                // if(kid.tagName == "body")bodyKids = el.chilren
            })
        }
    })

htmlKids.forEach(el =>{
    if (el.children != undefined & el.tagName == "li"){
       htmlKids = [htmlKids.slice(0, htmlKids.indexOf(el - 1)).toString(), `${ol}`, htmlKids.slice(htmlKids.indexOf(el).toString())].join('')

    }

})
let test = toHTML(htmlKids)
console.log("TEST=========================\n",test)
fs.writeFileSync(`test/${file}`, toHTML(htmlKids))
}

function prepHTML(html){
    return html
      .replace(/&[^;]+;/gmi, (match) => {
        if (!/^&(?:lt|gt|nbsp|quot|a(?:mp|pos)|#(?:6[02]|160|x(?:3[CE]|A0|2[267])|3[489]));$/.test(match)) {
          match = he.decode(match)
        }
        return match
      })
      .replace(/\bMc\b/g, 'Mic')
  }
