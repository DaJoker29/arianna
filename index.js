#!/usr/bin/env node
const WebClient = require('@slack/client').WebClient;
const schedule = require('node-schedule');
const config = require('./config.json');

/**
 * Arianna - Zero Daedalus Slackbot
 * @module  arianna
 */

console.log('Arianna Running...');

const token = config.SLACK_TOKEN || '';
const web = new WebClient(token);

const botOpts = {
  username: 'Arianna',
  icon_emoji: ':arianna:',
};

const messages = [
  'South America is waiting. Take a step closer today.',
  'All you want exists just beyond your comfort zone.',
  'Show those around you that you love them by helping to solve one of their problems.',
  'You only have one body. Show it some respect today. Exercise, eat right and meditate.',
  'It takes a lifetime to build a good reputation and a moment to destroy it. Do some good today.',
  'Stress and anxiety are silent killers. Look after your mental health today.',
  'Go deeper today. Try to solve a problem that you couldn\'t before.',
];

function reminder() {
  const today = new Date();
  const day = today.getDay();

  web.chat.postMessage('D349GLKS5', messages[day], botOpts, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`Message Sent: ${JSON.stringify(res)}`);
    }
  });
}

schedule.scheduleJob('0 */8 * * *', reminder);
console.log('Testing...');
reminder();