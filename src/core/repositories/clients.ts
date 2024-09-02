import { TableEnum } from "core/db/enums";
import { BaseRepo } from "./base";
import Decimal from "decimal.js";
import { ClientDoesNotExists } from "utils/exceptions";

interface ClientBalance {
    quoteBalance: Decimal;
    tokensBalance: Decimal;
}

export class ClientsRepo extends BaseRepo {
    protected static mainTable = TableEnum.Clients;

    getBalance = async (userId: string): Promise<ClientBalance> => {
        const client = await this.trx(TableEnum.Clients)
            .select("balance_quote", "balance_tokens")
            .where({ id: userId })
            .first();
        if (!client) {
            throw new ClientDoesNotExists();
        }
        return { quoteBalance: new Decimal(client.balance_quote), tokensBalance: new Decimal(client.balance_tokens) };
    };

    updateClientBalance = async (userId: string, quoteBalance: Decimal, tokensBalance: Decimal): Promise<void> => {
        const query = `
            UPDATE clients
            SET balance_quote = balance_quote + :quoteBalance,
                balance_tokens = balance_tokens + :tokensBalance
            WHERE id = :userId
        `;
        const params = { quoteBalance: quoteBalance.toString(), tokensBalance: tokensBalance.toString(), userId };
        await this.raw_query<undefined>(query, params);
    };
}
