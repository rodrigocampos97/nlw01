import path from 'path';

module.exports = {
	client: 'mysql',
	connection: {
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'ecoleta'
	},
	migrations: {
		directory: path.resolve(__dirname, 'src', 'database', 'migrations'),
	},
	seeds: {
		directory: path.resolve(__dirname, 'src', 'database', 'seeds'),
	}
};