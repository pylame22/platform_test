import { AssetsRepo } from "core/repositories/assets";
import { BalancesRepo } from "core/repositories/balances";
import { ClientsRepo } from "core/repositories/clients";
import { TransactionsRepo } from "core/repositories/transactions";
import { PositionsService } from "core/services/positions";
import { Request, Response } from "express";
import { RaydiumService } from "core/services/dex/raydium";
import { StatusCodes } from "http-status-codes";
import { database } from "core/db/knex";
import { Knex } from "knex";
import Decimal from "decimal.js";

const positionServiceFactory = (trx: Knex.Transaction): PositionsService => {
    const assetsRepo = new AssetsRepo(trx);
    const clientsRepo = new ClientsRepo(trx);
    const transactionsRepo = new TransactionsRepo(trx);
    const balancesRepo = new BalancesRepo(trx);
    const dexService = new RaydiumService(RaydiumService.getConnection(), RaydiumService.getWallet());
    return new PositionsService(assetsRepo, clientsRepo, transactionsRepo, balancesRepo, dexService);
};

export const openLongPosition = async (request: Request, response: Response): Promise<void> => {
    await database.transaction(async (trx) => {
        const positionService = positionServiceFactory(trx);
        await positionService.openLongPosition(
            request.body.asset_id,
            new Decimal(request.body.amount_token),
            request.body.user_id,
        );
        response.status(StatusCodes.OK).send();
    });
};

export const closeLongPosition = async (request: Request, response: Response): Promise<void> => {
    await database.transaction(async (trx) => {
        const positionService = positionServiceFactory(trx);
        await positionService.closeLongPosition(
            request.body.asset_id,
            new Decimal(request.body.amount_token),
            request.body.user_id,
        );
        response.status(StatusCodes.OK).send();
    });
};
