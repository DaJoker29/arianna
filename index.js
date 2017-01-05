#!/usr/bin/env node
const fs = require('fs');
const schedule = require('node-schedule');
const SQLite = require('sqlite3').verbose();
const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const config = require('./config.json');
const reminders = require('./reminders.json');

/**
 * Arianna - Zero Daedalus Slackbot
 * @module  arianna
 */

console.log('Arianna Running...');

// Check for proper configuration
if ('string' !== typeof config.SLACK_TOKEN) {
  console.log('No slack token provided to config');
  process.exit(1);
}

if (!fs.existsSync(config.DB_PATH)) {
  console.log('Joke database not found');
  process.exit(1);
}

const rtm = new RtmClient(config.SLACK_TOKEN);
const db = new SQLite.Database(config.DB_PATH);

let bot = '';

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (data) => {
  bot = data.self;
  console.log(`Logged in as ${data.self.name} of team ${data.team.name}, but not yet connected to a channel`);
});

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
  console.log('Connection opened...');
});

rtm.on(RTM_EVENTS.MESSAGE, msgHandler);

// Schedule Repeated Tasks
schedule.scheduleJob('0 */6 * * *', reminder);
schedule.scheduleJob('0 */6 * * *', quote);

// Watch Slack
rtm.start();

/**
 * Functions
 */

function msgHandler(message) {
  if (checkMessage(message)) {
    // Check for Chuck Norris references
    if (-1 < message.text.toLowerCase().indexOf('chuck norris')) {
      db.get('SELECT id, joke FROM jokes ORDER BY used ASC, RANDOM() LIMIT 1', (err, record) => {
        if (err) {
          return console.error('DATABASE ERROR:', err);
        }

        rtm.sendMessage(record.joke, message.channel);
        db.run('UPDATE jokes SET used = used + 1 WHERE id = ?', record.id);
      });
    }
  }
}

// Check if message is a valid message to respond to.
function checkMessage(message) {
  const chatCheck = 'message' === message.type && !!message.text;
  const channelCheck = 'string' === typeof message.channel;
  const botCheck = message.user !== bot.id;
  return chatCheck && channelCheck && botCheck;
}

// Send a personalized motivational reminder to me
function reminder() {
  const day = (new Date()).getDay();

  rtm.sendMessage(reminders.messages[day], reminders.channel); 
}

// Posts a random quote from the quotes file
function quote() {
  fs.readFile('quotes.txt', 'utf8', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const lines = data.split('\n');
      const rand = Math.floor(Math.random() * lines.length);

      const quote = lines[rand].match(/".+"/g)[0].slice(1, -1);
      rtm.sendMessage(`> *_${quote}_*`, config.SLACK_CHANNEL);
    }
  });
}