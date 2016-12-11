#!/usr/bin/env node
const schedule = require('node-schedule');
const WebClient = require('@slack/client').WebClient;
const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

const config = require('./config.json');

// const reminders = require('./libs/reminders.js');

/**
 * Arianna - Zero Daedalus Slackbot
 * @module  arianna
 */

console.log('Arianna Running...');

const token = config.SLACK_TOKEN || '';
const rtm = new RtmClient(token);

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (data) => {
  console.log(`Logged in as ${data.self.name} of team ${data.team.name}, but not yet connected to a channel`);
});

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
  rtm.sendMessage('Back online...', config.SLACK_CHANNEL);
});

rtm.start();
// const web = new WebClient(token);

// const botOpts = {
//   username: 'Arianna',
//   icon_emoji: ':arianna:',
// };

// const messages = [
//   'South America is waiting. Take a step closer today.',
//   'All you want exists just beyond your comfort zone.',
//   'Show those around you that you love them by helping to solve one of their problems.',
//   'You only have one body. Show it some respect today. Exercise, eat right and meditate.',
//   'It takes a lifetime to build a good reputation and a moment to destroy it.
//    Do some good today.',
//   'Stress and anxiety are silent killers. Look after your mental health today.',
//   'Go deeper today. Try to solve a problem that you couldn\'t before.',
// ];

// function reminder() {
//   const today = new Date();
//   const day = today.getDay();

//   web.chat.postMessage('D349GLKS5', messages[day], botOpts, (err, res) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(`Message Sent: ${JSON.stringify(res)}`);
//     }
//   });
// }

// schedule.scheduleJob('0 */8 * * *', reminders);
// console.log('Testing...');