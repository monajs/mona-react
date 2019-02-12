const pkg = require('../package.json')
const { exec } = require('child_process')
const { saveConfig, log } = require('./util')

const { name, version, author, email, description, keywords, repository, files, main } = pkg

const packageJsonPath = `${process.cwd()}/package/package.json`

const babelCmd = 'rm -rf package&&cp -r react package&&babel react --out-dir package'
exec(babelCmd, (error, stdout) => {
	if (error) {
		log.error(error)
	} else {
		log.info(stdout)
		saveConfig({
			name,
			version,
			author,
			email,
			description,
			keywords,
			repository,
			files,
			main
		}, packageJsonPath)
		log.success('生成package成功！')
	}
})
