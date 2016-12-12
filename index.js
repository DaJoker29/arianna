#!/usr/bin/env node
const fs = require('fs');
const schedule = require('node-schedule');
const RtmClient = require('@slack/client').RtmClient;
const WebClient = require('@slack/client').WebClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

const config = require('./config.json');
const reminders = require('./reminders.json');

/**
 * Arianna - Zero Daedalus Slackbot
 * @module  arianna
 */

console.log('Arianna Running...');

const token = config.SLACK_TOKEN || '';
const rtm = new RtmClient(token);
const web = new WebClient(token);

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (data) => {
  console.log(`Logged in as ${data.self.name} of team ${data.team.name}, but not yet connected to a channel`);
});

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
  rtm.sendMessage('Back online...', config.SLACK_CHANNEL);
});

// Schedule Repeated Tasks
schedule.scheduleJob('0 */4 * * *', reminder);
schedule.scheduleJob('0 10 * * *', quote);

// Watch Slack
rtm.start();

// Handle Exits
process.on('exit', handleExit);

/**
 * Functions
 */

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

// Alerts the channel that the bot is down.
function handleExit() {
  web.chat.postMessage(config.SLACK_CHANNEL, 'Going offline...', { as_user: true }, () => {
    console.log('Goodbye!');
  });
}