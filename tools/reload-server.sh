#!/bin/sh
# Reload server with new configuration settings.
pm2 delete arianna
npm run start