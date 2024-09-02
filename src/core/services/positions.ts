import { AssetsRepo } from "core/repositories/assets";
import { ClientsRepo } from "core/repositories/clients";
import { TransactionsRepo } from "core/repositories/transactions";
import { BalancesRepo } from "core/repositories/balances";
import Decimal from "decimal.js";
import { BaseDexService } from "core/services/dex/base";
import { NotEnoughBalanceError } from "utils/exceptions";
import { PositionTypeEnum, TransactionData, TransactionTypeEnum } from "schemas/transactions";

export class PositionsService {
    assetsRepo: AssetsRepo;
    clientsRepo: ClientsRepo;
    transactionsRepo: TransactionsRepo;
    balancesRepo: BalancesRepo;
    dexService: BaseDexService;

    constructor(
        assetsRepo: AssetsRepo,
        clientsRepo: ClientsRepo,
        transactionsRepo: TransactionsRepo,
        balancesRepo: BalancesRepo,
        dexService: BaseDexService,
    ) {
        this.assetsRepo = assetsRepo;
        this.clientsRepo = clientsRepo;
        this.transactionsRepo = transactionsRepo;
        this.balancesRepo = balancesRepo;
        this.dexService = dexService;
    }

    openLongPosition = async (assetId: string, amountMainToken: Decimal, userId: string): Promise<void> => {
        const contractAddress = await this.assetsRepo.getContractAddress(assetId);
        const clientBalance = await this.clientsRepo.getBalance(userId);

        if (clientBalance.quoteBalance.lt(amountMainToken)) {
            throw new NotEnoughBalanceError();
        }
        const [transactionId, amountSwappedToken] = await this.dexService.swapToken(
            contractAddress,
            amountMainToken,
            false,
        );

        await this.clientsRepo.updateClientBalance(userId, amountMainToken.neg(), amountSwappedToken);
        const [balanceTokens, balanceOldTokens] = await this.balancesRepo.updateBalance(
            amountMainToken.neg(),
            amountSwappedToken,
        );
        const transactionData: TransactionData = {
            userId,
            amountMainToken,
            amountSwappedToken,
            transactionId,
            assetId,
            balanceTokens,
            balanceOldTokens,
            type: TransactionTypeEnum.OpenPosition,
            positionType: PositionTypeEnum.Long,
        };
        await this.transactionsRepo.create(transactionData);
    };

    closeLongPosition = async (assetId: string, amountSwappedToken: Decimal, userId: string): Promise<void> => {
        const contractAddress = await this.assetsRepo.getContractAddress(assetId);
        const clientBalance = await this.clientsRepo.getBalance(userId);
        if (amountSwappedToken.gt(clientBalance.tokensBalance)) {
            throw new NotEnoughBalanceError();
        }
        const [transactionId, amountMainToken] = await this.dexService.swapToken(
            contractAddress,
            amountSwappedToken,
            true,
        );
        await this.clientsRepo.updateClientBalance(userId, amountMainToken, amountSwappedToken.neg());
        const [balanceTokens, balanceOldTokens] = await this.balancesRepo.updateBalance(
            amountMainToken,
            amountSwappedToken.neg(),
        );
        const transactionData: TransactionData = {
            userId,
            amountMainToken,
            amountSwappedToken,
            transactionId,
            assetId,
            balanceTokens,
            balanceOldTokens,
            type: TransactionTypeEnum.ClosePosition,
            positionType: PositionTypeEnum.Long,
        };
        await this.transactionsRepo.create(transactionData);
    };
}
