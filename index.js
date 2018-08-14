#!/usr/bin/env node
const fs = require('fs');
const schedule = require('node-schedule');
const { RTMClient } = require('@slack/client');

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

const rtm = new RTMClient(config.SLACK_TOKEN);

let bot = '';

rtm.on('authenticated', (data) => {
  bot = data.self;
  console.log(`Logged in as ${data.self.name} of team ${data.team.name}, but not yet connected to a channel`);
});

rtm.on('ready', () => {
  console.log('Connection opened...');
});

rtm.on('message', msgHandler);

// Schedule Repeated Tasks
// schedule.scheduleJob('0 */6 * * *', reminder);
schedule.scheduleJob('0 */6 * * *', quote);

// Watch Slack
rtm.start();

/**
 * Functions
 */

function msgHandler(message) {
  if (checkMessage(message)) {
    console.log(`Incoming message: ${message.ts}`);
    if ('quote' === message.text.toLowerCase()) {
      quote();
    } else if ('reminder' === message.text.toLowerCase()) {
      reminder();
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
      rtm.sendMessage(`> *_${quote}_*`, config.SLACK_CHANNEL)
        .then((res) => {
          console.log(`Message sent: ${res.ts}`);
        })
        .catch(console.error);
    }
  });
}