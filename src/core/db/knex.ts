import Knex from "knex";
import config from "utils/config";

export const knexConfig: Knex.Knex.Config = {
    client: "pg",
    connection: {
        host: config.postgres.host,
        user: config.postgres.user,
        password: config.postgres.password,
        database: config.postgres.db_name,
    },
    pool: {
        min: config.postgres.min_pool_size,
        max: config.postgres.max_pool_size,
    },
    migrations: {
        directory: "./knex/migrations",
    },
    seeds: {
        directory: "./knex/seeds",
    },
};

export const database = Knex(knexConfig);
