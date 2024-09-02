import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    const uuid_generate_func = knex.raw("uuid_generate_v4()");
    await knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await knex.schema
        .createTable("clients", (table) => {
            table.uuid("id").primary().defaultTo(uuid_generate_func);
            table.string("name").notNullable();
            table.decimal("balance_quote", 18, 8).defaultTo(0).notNullable();
            table.decimal("balance_tokens", 18, 8).defaultTo(0).notNullable();
        })
        .createTable("platform_balance", (table) => {
            table.uuid("id").primary().defaultTo(uuid_generate_func);
            table.decimal("balance_tokens", 18, 8).defaultTo(0).notNullable();
            table.decimal("balance_sol", 18, 8).defaultTo(0).notNullable();
            table.timestamp("last_updated").defaultTo(knex.fn.now()).notNullable();
        })
        .createTable("assets", (table) => {
            table.uuid("id").primary().defaultTo(uuid_generate_func);
            table.string("ticker").notNullable();
            table.string("contract_address").notNullable();
        })
        .createTable("transactions", (table) => {
            table.uuid("id").primary().defaultTo(uuid_generate_func);
            table.uuid("client_id").references("clients.id").notNullable();
            table.uuid("asset_id").references("assets.id").notNullable();
            table.enum("transaction_type", ["open_position", "close_position"]).notNullable();
            table.enum("position_type", ["long", "short"]).notNullable();
            table.decimal("amount_token", 18, 8).notNullable();
            table.decimal("quote_amount", 18, 8).notNullable();
            table.enum("status", ["pending", "successful", "failed"]).notNullable();
            table.timestamp("date").defaultTo(knex.fn.now()).notNullable();
            table.string("dex_transaction_id").notNullable();
            table.decimal("platform_balance_before", 18, 8).notNullable();
            table.decimal("platform_balance_after", 18, 8).notNullable();
        });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("assets").dropTable("transactions").dropTable("platform_balance").dropTable("clients");
    await knex.schema.raw('DROP EXTENSION "uuid-ossp"');
}
