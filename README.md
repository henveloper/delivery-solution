# Response to the requirements

1. This solution is implemented per specifications.

2. `docker-compose.yml` and `start.sh` is implemented as expected that sets up the api server and the database.

3. The solution is written in Node.js (Typescript)

4. /

5. Unit / Endpoint / Integration tests are written.

6./

7./

# Response to the problem statement

1. /

2. /

3. Validation is performed with validation frameworks provided by the http framework.

4. Distance Matrix API key should be put in `.env`. As it is ignored by `.gitignore`, please rename `.sample.env` to `.env` and replace the `GMAP_KEY` value.

5. MySQL is used, initialization is done by docker compose volume mapping to an init file `./db/init.sql

6. /

# Response to the Api Interface

### POST /orders

* lat/lng values are assumed to be numeric string in decimal degrees.

```raw
https://support.google.com/maps/answer/18539?hl=en&co=GENIE.Platform%3DDesktop#:~:text=Here%20are%20examples%20of%20formats,2%C2%B010'26.5%22E

Decimal degrees (DD): 41.40338, 2.17403
Degrees, minutes, and seconds (DMS): 41°24'12.2"N 2°10'26.5"E
Degrees and decimal minutes (DMM): 41 24.2028, 2 10.4418
```