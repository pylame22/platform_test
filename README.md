## install
### settings
all settings are stored in files: .env (.env.example) and config.yml
### database
`docker-compose build`

`docker-compose up -d`
### node
`npm i`

`npm run knex migrate:latest`

`npm run knex seed:run`

`npm run dev`

## request example
default loaded token - RAY

`curl --location 'http://localhost:3000/api/positions/open_long' \
--header 'Content-Type: application/json' \
--data '{
    "user_id": "bfdd7255-1d61-4203-ae06-d40edfdfd3bd",
    "asset_id": "96311075-8edc-4e7e-8193-c5a182a39d38",
    "amount_token": "1"
}'`

`curl --location 'http://localhost:3000/api/positions/close_long' \
--header 'Content-Type: application/json' \
--data '{
    "user_id": "bfdd7255-1d61-4203-ae06-d40edfdfd3bd",
    "asset_id": "96311075-8edc-4e7e-8193-c5a182a39d38",
    "amount_token": "1"
}'`