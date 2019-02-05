const { expect } = require('chai')
const fs = require('fs-extra')
const md5 = require('md5')
const request = require('supertest')
const cheerio = require('cheerio')
const serveFactory = require('./serve')

describe('simple input scenario', () => {
  let etag
  let app
  function prepareTestDirectory() {
    fs.emptyDirSync('test')
    let content = '<form><input name="test" value="1234"></form>'
    etag = md5(content)
    fs.writeFileSync('test/index.html', content)
    fs.writeFileSync('test/test.txt', '1234')
    fs.writeFileSync('test/example.sh', '#!/bin/bash\necho "/1234.html"')
    fs.chmodSync('test/example.sh', 0777)
  }

  beforeEach(() => {
    prepareTestDirectory()
    app = serveFactory({ directory: 'test' })
  })

  it('serves up correct etag when getting html', async () => {
    const req = await request(app)
      .get('/index.html')

    const $ = cheerio.load(req.res.text)
    expect($('input[name=etag]').val()).to.equal(etag)
    expect($('input[name=test]').val()).to.equal('1234')
    expect($('form').attr('method')).to.equal('POST')
    expect($('form').attr('enctype')).to.equal('application/x-www-form-urlencoded')
  })

  it('serves up non-html', async () => {
    const req = await request(app)
      .get('/test.txt')
    expect(req.res.text).to.equal('1234')
  })

  it('updates up correct etag when getting html', async () => {
    const req = await request(app)
      .post('/index.html')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send(`etag=${etag}&test=5432`)

    const $ = cheerio.load(req.res.text)
    expect($('input[name=etag]').val()).not.to.equal(etag)
    expect($('input[name=test]').val()).to.equal('5432')
    expect($('form').attr('method')).to.equal('POST')
    expect($('form').attr('enctype')).to.equal('application/x-www-form-urlencoded')
  })

  it('executes bash files', async () => {
    const req = await request(app)
      .get('/example.sh')
    
    expect(req.status).to.equal(302)
    expect(req.header['location']).to.equal('/1234.html')
  })

})