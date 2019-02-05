const express = require('express')
const path = require('path')
const cheerio = require('cheerio')
const bodyParser = require('body-parser')
const fs = require('fs')
const md5 = require('md5')
const shell = require('shelljs')

function serveFactory({ directory }) {
  const app = express()

  app.use(bodyParser.urlencoded({ extended: true }))

  
  app.use(function (req, res, next) {
    let pathname = req.path
    if (pathname === '/') {
      pathname = '/index.html'
    }
    const fname = path.resolve(directory, '.' + pathname)

    if (fname.endsWith('.sh')) {
      const result = shell.exec(fname)
      const dest = result.stdout.trim()
      res.redirect(dest)
    } else if (fname.endsWith('.html')) {
      let content = fs.readFileSync(fname, { encoding: 'utf8' })
      const $ = cheerio.load(content)

      if (req.method === 'POST') {
        for (const key in req.body) {
          const value = req.body[key]
          $(`[name=${key}]`).val(value)
          content = $.html()
          fs.writeFileSync(fname, content)
        }
      }

      $('form').attr('method', 'POST')
      $('form').attr('enctype', 'application/x-www-form-urlencoded')
      $('form').append(`<input name="etag" value="${md5(content)}" type="hidden">`)
      res.end($.html())
    } else {
      next()
    }
  })
  app.use(express.static(directory))
  return app
}

module.exports = serveFactory