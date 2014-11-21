var app = require('koa')()
var qs = require('querystring')

app.use(function *(next) {
	var query = this.query
	var fileNum = query.file = Number(query.file) || 1  // 31
	var fileSize = query.size = Number(query.size) || 500000
	var ruleNum = query.rule = Number(query.rule) || 4095

	if (this.path == '/css') {
		yield css
		return
	}
	this.type = 'text/html'

	var html = [
		'<html><title>IE CSS limitation test</title>',
		'<head>',
		'<style>',
		'  input { font-size: 1em; width: auto; }',
		'  button { font-size: 1em; padding: 0.2em 0.6em; background: #c9c0c0; border: 1px solid #dff; }',
		'</style>'
	]

	var i = 1
	while (i < fileNum) {
		html.push('<link type="text/css" rel="stylesheet" href="css?' + qs.stringify(query) + '">')
		i += 1
	}
	html.push('<link type="text/css" rel="stylesheet" href="css?' + qs.stringify(query) + '&final=1">')

	html = html.concat([
		'<head>',
		'<body>',
		'  <form action="">',
		'  <p>I want <input type="text" size="1" name="file" value="' + fileNum + '"> css files,' +
				'with file size no large than <input size="6" type="text" name="size" value="' +
				fileSize + '"> bytes (' + (fileSize/1024).toFixed(2) + 'kb), and at most ' +
				'<input size="6" type="text" name="rule" value="' + ruleNum + '"> rules.',
		'  <p><button type="submit">Submit</button>',
		'  <p>The background will be <strong>RED</strong> if limit exceeded.',
		'  </form>',
		'</body>',
		'</html>'
	])
	this.body = html.join('\n')
})


function *css(next) {
	var query = this.query
	var content = [], ruleNum = query.rule, fileSize = query.size
	var rule1 = 'body { background: red; margin: 0; margin: 20px; margin: 0; margin: 30px; font-size: 24px; }'
	var finalRule = 'body { background: #E2EDF9; }'
	var bullshit = '/* this is bullshit */'
	var byteLen1 = Buffer.byteLength(rule1 + '\n', 'utf8')
	var byteLen2 = Buffer.byteLength(bullshit + '\n', 'utf8')

	if (query.final) {
		fileSize -= Buffer.byteLength(finalRule, 'utf8')
	}

	while (ruleNum > 0 && fileSize > 0) {
		content.push(rule1)
		ruleNum -= 1
		fileSize -= byteLen1
	}
	// file size limit not reached, let's add some bullshit
	while (fileSize > 0) {
		content.push(bullshit)
		fileSize -= byteLen2
	}

	if (query.final) {
		// the final should work
		content.push(finalRule)
	}

	this.type = 'text/css'
	this.body = content.join('\n')
}

if (!module.parent) {
	app.listen(process.env.PORT || 3000);
	console.log('Listening on http://127.0.0.1:3000');
}
