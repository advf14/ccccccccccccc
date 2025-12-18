const fs = require('fs');
const path = require('path');

let mongoUri = 'mongodb://127.0.0.1:27017';

// Try to read from luudata.txt
try {
	const luudataPath = path.join(__dirname, '../luudata.txt');
	if (fs.existsSync(luudataPath)) {
		const fileContent = fs.readFileSync(luudataPath, 'utf8').trim();
		if (fileContent) {
			mongoUri = fileContent;
			console.log('[DB] Loaded MongoDB URI from luudata.txt');
		}
	}
} catch(err) {
	console.log('[DB] Could not read luudata.txt, using default URI');
}

// Fall back to env variable or default
mongoUri = process.env.MONGODB_URI || mongoUri;

module.exports = {
	'url': mongoUri,
	'options': {
		'dbName': 'CLUB3333', // red
		//'dbName': 'GAME', // red
		//'dbName': 'admin', // red
		//'dbName': 'vn11022021', // red
		'useNewUrlParser': true,
		'useUnifiedTopology': true,
		//'autoIndex':       false,
	},
};
