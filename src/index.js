const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')

app.use(bodyParser.urlencoded({ extended: true }))

app.use(function (req, res, next) {
  if (req.method === 'POST') {
    console.log(req.path)
    const fname = path.join('./example', req.path)
    const markup = fs.readFileSync(fname, {encoding:'utf8'})
    const $ = cheerio.load(markup)
    
    console.log(req.body)
    for (const key in req.body) {
      const value = req.body[key]
      $(`[name=${key}]`).val(value)
    }
    fs.writeFileSync(fname, $.html())
    req.method = 'GET'
  }
  next()
})

app.use(express.static('./example'))

app.listen(8080, () => {
  console.log('LISTENING')
})