const commander = require('commander')
const serveFactory = require('./serve')

commander
  .description('serve-files serves up a dynamic site based on html. it\s not suitable for production usage.')
  .arguments(`[port] [directory]`)
  .action((port = '8080', directory = 'static') => {
    const app = serveFactory({ directory })
    app.listen(port, () => {
      console.log(`Serving ${directory} on port ${port}`)
    })
  })

commander.parse(process.argv)

