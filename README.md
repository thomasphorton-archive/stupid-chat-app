chat
====

# Before developing
## Extras
* Install [Postgress.app](http://postgresapp.com/)
* Run Postgress.app

## In the terminal
* `git clone git@github.com:thomasphorton/chat.git`
* `cd chat`
* `npm install`
* `cp ./config/development.json.example ./config/development.json`
* Edit `./development.json`
* `node schema-build`
* `node app`

TODO:
Check out issues for ideas.
Update legacy dependencies.
Build test harness.

# Troubleshooting
* `Error: Could not locate the bindings file. Tried:`
  - seems to be an issue with a bad node.js version
  - install [nvm](https://github.com/creationix/nvm)
  - `nvm install v0.10.26`
  - `npm install`
