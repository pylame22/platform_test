import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("clients").insert([
        { id: "bfdd7255-1d61-4203-ae06-d40edfdfd3bd", name: "Client 1", balance_quote: "10" },
        { id: "58303a74-1b8f-4a01-8984-4b4c6d7d86ef", name: "Client 2", balance_quote: "5" },
    ]);
    await knex("platform_balance").insert([
        { id: "96311075-8edc-4e7e-8193-c5a182a39d38", balance_tokens: "100000", balance_sol: "100" },
    ]);
    await knex("assets").insert([
        {
            id: "96311075-8edc-4e7e-8193-c5a182a39d38",
            ticker: "RAY",
            contract_address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        },
    ]);
}
