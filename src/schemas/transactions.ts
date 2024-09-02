// userId, amountMainToken, amountSwappedToken, transactionId

import Decimal from "decimal.js";

export enum TransactionTypeEnum {
    OpenPosition = "open_position",
    ClosePosition = "close_position",
}

export enum PositionTypeEnum {
    Long = "long",
    Short = "short",
}

export enum PositionStatusEnum {
    Pending = "pending",
    Successful = "successful",
    Failed = "failed",
}

export interface TransactionData {
    userId: string;
    amountMainToken: Decimal;
    amountSwappedToken: Decimal;
    transactionId: string;
    assetId: string;
    balanceTokens: Decimal;
    balanceOldTokens: Decimal;
    type: TransactionTypeEnum;
    positionType: PositionTypeEnum;
}
