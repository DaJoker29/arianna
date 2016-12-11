#!/usr/bin/env node
const schedule = require('node-schedule');
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
  reminder();
});

schedule.scheduleJob('0 */7 * * *', reminder); 

rtm.start();

function reminder() {
  const today = new Date();
  const day = today.getDay();
  const messages = [
    'South America is waiting. Take a step closer today.',
    'All you want exists just beyond your comfort zone.',
    'Show those around you that you love them by helping to solve one of their problems.',
    'You only have one body. Show it some respect today. Exercise, eat right and meditate.',
    'It takes a lifetime to build a good reputation and a moment to destroy it. Do some good today.',
    'Stress and anxiety are silent killers. Look after your mental health today.',
    'Go deeper today. Try to solve a problem that you couldn\'t before.',
  ];

  rtm.sendMessage(messages[day], 'D3DAMT9UL'); // Send a personalized message to me daily
}