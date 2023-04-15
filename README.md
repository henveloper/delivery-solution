## setup

Rename `./.sample.env` to `./.env`, put your gmap key in the form and run `./start.sh`

# Entry

1. `./start.sh` simply calls `docker compose up`.

2. Compose builds and runs the api, MySQL database is initialized by volume mounted sql commands in `./db/init.sql`.

3. Time-wise, required half a minute for the MySQL instance to start accepting connection on local machine, api server retries in intervals of 10s.

# Response to the requirements

* http api is written in NodeJS (Typescript)

* tests for classes / api / integration are written

# Response to the API interfaces

* POST coordinates is assumed to be in DD (decimal degrees) format eg `["-80.5", "140.555"]`

* PATCH race condition handling is done by update where with returned row count as success indicator. `update where` is txn safe.

* GET limit query is interpreted as the page size and the expected offset limit logic is at work.
