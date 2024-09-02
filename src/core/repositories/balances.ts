import { TableEnum } from "core/db/enums";
import { BaseRepo } from "./base";
import Decimal from "decimal.js";

interface UpdateBalanceType {
    tokens: string;
    old_tokens: string;
}

export class BalancesRepo extends BaseRepo {
    protected static mainTable = TableEnum.PlatformBalance;

    updateBalance = async (amountMainToken: Decimal, amountSwappedToken: Decimal): Promise<[Decimal, Decimal]> => {
        const query = `
            UPDATE platform_balance pb
            SET balance_sol = pb.balance_sol + :amountMainToken,
                balance_tokens = pb.balance_tokens + :amountSwappedToken
            FROM platform_balance pb_old
            WHERE pb.id = pb_old.id
            RETURNING pb.balance_tokens as tokens, pb_old.balance_tokens as old_tokens
        `;
        const params = {
            amountMainToken: amountMainToken.toString(),
            amountSwappedToken: amountSwappedToken.toString(),
        };
        const balance = await this.raw_query<UpdateBalanceType>(query, params);
        return [new Decimal(balance.tokens), new Decimal(balance.old_tokens)];
    };
}
