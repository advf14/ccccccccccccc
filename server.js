
require('dotenv').config();
var cors = require('cors');
let Telegram      = require('node-telegram-bot-api');
let TelegramToken = '5180271425:AAFGUtqkl4_laRpVksB4YTCswsx63sLBDew';
let TelegramBot   = new Telegram(TelegramToken, {polling: true});
let fs                    = require('fs');
//let https               = require('https')
//let privateKey    = fs.readFileSync('./ssl/b86club.key', 'utf8');
//let certificate   = fs.readFileSync('./ssl/b86club.pem', 'utf8');
//let credentials   = {key: privateKey, cert: certificate};
let express       = require('express');
let app           = express();
//let server              = https.createServer(credentials, app);

// Global error handlers to prevent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.message);
});

app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200
}));
let port       = process.env.PORT || 80;
let expressWs  = require('express-ws')(app);
let bodyParser = require('body-parser');
var morgan = require('morgan');
// Setting & Connect to the Database
let configDB = require('./config/database');
let mongoose = require('mongoose');
require('mongoose-long')(mongoose); // INT 64bit
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex',   true);

// Re-enable mongoose buffering but with timeout settings
mongoose.set('bufferCommands', true);
mongoose.set('bufferTimeoutMS', 2000); // 2 second timeout instead of 10

// Add connection logging
console.log('Connecting to MongoDB...', configDB.url.substring(0, 50) + '...');
configDB.options.serverSelectionTimeoutMS = 3000;
configDB.options.connectTimeoutMS = 3000;

let dbConnected = false;

mongoose.connect(configDB.url, configDB.options)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    dbConnected = true;
    console.log('✅ Database is ready for use');
    // Load admin config only after connection succeeds
    try {
      require('./config/admin');
    } catch(e) {
      console.error('Could not load admin config:', e.message);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Server will run without database');
    dbConnected = false;
  });

// Handle connection errors after initial connect
mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
  dbConnected = false;
});

// đọc dữ liệu from
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(morgan('combined'));
app.set('view engine', 'ejs'); // chỉ định view engine là ejs
app.set('views', './views');   // chỉ định thư mục view
// Serve static html, js, css, and image files from the 'public' directory
app.use(express.static('public'));
// server socket
let redT = expressWs.getWss();
process.redT = redT;
redT.telegram = TelegramBot;
global['redT'] = redT;
global['userOnline'] = 0;

// Wrap all route loading to prevent crashes
try {
  require('./app/Helpers/socketUser')(redT); // Add function socket
} catch(e) {
  console.error('Error loading socketUser:', e.message);
}

try {
  require('./routerHttp')(app, redT);   // load các routes HTTP
} catch(e) {
  console.error('Error loading routerHttp:', e.message);
}

try {
  require('./routerCMS')(app, redT);      //load routes CMS
} catch(e) {
  console.error('Error loading routerCMS:', e.message);
}

try {
  require('./routerSocket')(app, redT); // load các routes WebSocket
} catch(e) {
  console.error('Error loading routerSocket:', e.message);
}

// Skip crons entirely if database not available
if (dbConnected) {
  setTimeout(() => {
    try {
      require('./app/Cron/taixiu')(redT);   // Chạy game Tài Xỉu
    } catch(e) {
      console.error('Error loading taixiu cron:', e.message);
    }

    try {
      require('./app/Cron/baucua')(redT);   // Chạy game Bầu Cua
    } catch(e) {
      console.error('Error loading baucua cron:', e.message);
    }

    try {
      require('./config/cron')();
    } catch(e) {
      console.error('Error loading cron config:', e.message);
    }
  }, 6000);
} else {
  console.log('Database not available - cron jobs disabled');
}

try {
  require('./app/Telegram/Telegram')(redT); // Telegram Bot
} catch(e) {
  console.error('Error loading Telegram bot:', e.message);
}

app.listen(port, function() {
    console.log("Server listen on port ", port);
});
