import { TableEnum } from "core/db/enums";
import { BaseRepo } from "./base";
import { PositionStatusEnum, TransactionData } from "schemas/transactions";

export class TransactionsRepo extends BaseRepo {
    protected static mainTable = TableEnum.Transactions;

    create = async (transactionData: TransactionData): Promise<void> => {
        await this.trx(TableEnum.Transactions).insert({
            client_id: transactionData.userId,
            asset_id: transactionData.assetId,
            transaction_type: transactionData.type,
            position_type: transactionData.positionType,
            amount_token: transactionData.amountSwappedToken.toString(),
            quote_amount: transactionData.amountMainToken.toString(),
            status: PositionStatusEnum.Pending,
            dex_transaction_id: transactionData.transactionId,
            platform_balance_before: transactionData.balanceOldTokens.toString(),
            platform_balance_after: transactionData.balanceTokens.toString(),
        });
    };
}
