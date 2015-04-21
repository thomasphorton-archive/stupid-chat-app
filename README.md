chat
====

# Before developing
## Extras
* Install [Heroku toolbelt](https://toolbelt.heroku.com/)
* Install [Postgress.app](http://postgresapp.com/)
* Run Postgress.app

## In the terminal
* `git clone git@github.com:thomasphorton/chat.git`
* `cd chat`
* `npm install`
* Create `/.env` file based off of `/.env.example`.
* `node schema-build.js`
* `foreman start`

TODO:
Check out issues for ideas.
Update legacy dependencies.
Build test harness.

# Troubleshooting
* `Error: Could not locate the bindings file. Tried:`
  - install [nvm](https://github.com/creationix/nvm)
  - `nvm install v0.10.26`
  - `npm install`
