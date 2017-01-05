'use strict';

/**
 * Command line script that generates a SQLite database file that contains jokes about Chuck Norris using the
 * wonderful http://api.icndb.com/jokes APIs
 *
 * Usage:
 *
 *   node databaseGenerator.js [destFile]
 *
 *   destFile is optional and it will default to "norrisbot.db"
 *
 * @author Luciano Mammino <lucianomammino@gmail.com>
 */

const path = require('path');
const request = require('request');
const Async = require('async');
const ProgressBar = require('progress');
const sqlite3 = require('sqlite3').verbose();

const outputFile = process.argv[2] || path.resolve(__dirname, 'norrisbot.db');
const db = new sqlite3.Database(outputFile);

// executes an API request to count all the available jokes
request('http://api.icndb.com/jokes/count', (error, response, body) => {
  if (!error && 200 === response.statusCode) {
    const count = JSON.parse(body).value;
    let savedJokes = 0;
    let index = 0;
    const bar = new ProgressBar(':bar :current/:total', { total: count });

        // Prepares the database connection in serialized mode
    db.serialize();
        // Creates the database structure
    db.run('CREATE TABLE IF NOT EXISTS info (name TEXT PRIMARY KEY, val TEXT DEFAULT NULL)');
    db.run('CREATE TABLE IF NOT EXISTS jokes (id INTEGER PRIMARY KEY, joke TEXT, used INTEGER DEFAULT 0)');
    db.run('CREATE INDEX jokes_used_idx ON jokes (used)');

        // The idea from now on is to iterate through all the possible jokes starting from the index 1 until we can
        // find all the available ones. There might be holes in the sequence, so we might want to issue all the request
        // sequentially and count the successful requests until we get the total amount of jokes.
        // We are going to use the function Async.whilst so we need to define 3 functions: test, task and onComplete

        // Tests whether to stop fetching jokes. It gets called before starting a new iteration
    const test = function () {
      return savedJokes < count;
    };

        // The task executed at every iteration. Basically fetches a new joke and creates a new record in the database.
    const task = function (cb) {
      request(`http://api.icndb.com/jokes/${++index}?escape=javascript`, (err, response, body) => {
                // handle possible request errors by stopping the whole process
        if (err || 200 !== response.statusCode) {
          console.log(index, error, response.statusCode);

          return cb(error || response.statusCode);
        }

                // invalid ids generates an invalid JSON response (basically an HTML output), so we can
                // check for it by detecting JSON parse errors and skip the id by calling the callback completion
                // function for the current iteration
        let result = null;
        try {
          result = JSON.parse(body).value;
        } catch (ex) {
          return cb(null);
        }

        db.run('INSERT INTO jokes (joke) VALUES (?)', result.joke, (err) => {
          if (err) {
            return cb(err);
          }

          ++savedJokes;
          bar.tick();
          return cb(null);
        });
      });
    };

        // On completion we just need to show errors in case we had any and close the database connection
    const onComplete = function (err) {
      db.close();
      if (err) {
        console.log('Error: ', err);
        process.exit(1);
      }
    };

        // triggers the asynchronous iteration using the previously defined test, task and onComplete functions
    return Async.whilst(test, task, onComplete);
  }

  console.log('Error: unable to count the total number of jokes');
  process.exit(1);
});
