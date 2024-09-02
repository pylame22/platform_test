import Decimal from "decimal.js";
import { BaseDexService } from "./base";
import { Connection, Keypair, PublicKey, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import config from "utils/config";
import {
    CurrencyAmount,
    jsonInfo2PoolKeys,
    Liquidity,
    LiquidityPoolKeys,
    Percent,
    SPL_ACCOUNT_LAYOUT,
    Token,
    TOKEN_PROGRAM_ID,
    TokenAccount,
    TokenAmount,
} from "@raydium-io/raydium-sdk";
import { trimmedMainnetJson } from "utils/liquidity_pool";
import { LiquidityPoolNotExists } from "utils/exceptions";

export class RaydiumService extends BaseDexService {
    name = "Raydium";

    static getWallet = (): Keypair => {
        const secretKey = bs58.decode(config.dex.main_private_key);
        return Keypair.fromSecretKey(secretKey);
    };

    static getConnection = (): Connection => {
        return new Connection(config.dex.rpc_url);
    };

    findPoolKeys = (baseTokenMint: PublicKey, quoteTokenMint: PublicKey): LiquidityPoolKeys => {
        const poolData = trimmedMainnetJson.find(
            (i) =>
                (i.baseMint === baseTokenMint.toBase58() && i.quoteMint === quoteTokenMint.toBase58()) ||
                (i.baseMint === quoteTokenMint.toBase58() && i.quoteMint === baseTokenMint.toBase58()),
        );
        if (!poolData) throw new LiquidityPoolNotExists();
        return jsonInfo2PoolKeys(poolData) as LiquidityPoolKeys;
    };

    calcAmountOut = async (
        poolKeys: LiquidityPoolKeys,
        rawAmountIn: number,
        swapInDirection: boolean,
    ): Promise<[CurrencyAmount, CurrencyAmount, CurrencyAmount]> => {
        const poolInfo = await Liquidity.fetchInfo({ connection: this.connection, poolKeys });

        let currencyInMint = poolKeys.baseMint;
        let currencyInDecimals = poolInfo.baseDecimals;
        let currencyOutMint = poolKeys.quoteMint;
        let currencyOutDecimals = poolInfo.quoteDecimals;

        if (!swapInDirection) {
            currencyInMint = poolKeys.quoteMint;
            currencyInDecimals = poolInfo.quoteDecimals;
            currencyOutMint = poolKeys.baseMint;
            currencyOutDecimals = poolInfo.baseDecimals;
        }

        const currencyIn = new Token(TOKEN_PROGRAM_ID, currencyInMint, currencyInDecimals);
        const amountIn = new TokenAmount(currencyIn, rawAmountIn, false);

        const currencyOut = new Token(TOKEN_PROGRAM_ID, currencyOutMint, currencyOutDecimals);
        const slippage = new Percent(config.dex.max_slippage, 100);

        const { amountOut, minAmountOut } = Liquidity.computeAmountOut({
            poolKeys,
            poolInfo,
            amountIn,
            currencyOut,
            slippage,
        });

        return [amountOut, amountIn, minAmountOut];
    };

    getOwnerTokenAccounts = async (): Promise<TokenAccount[]> => {
        const walletTokenAccount = await this.connection.getTokenAccountsByOwner(this.wallet.publicKey, {
            programId: TOKEN_PROGRAM_ID,
        });

        return walletTokenAccount.value.map((i) => ({
            pubkey: i.pubkey,
            programId: i.account.owner,
            accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
        }));
    };

    swapToken = async (
        contractAddress: string,
        amountToken: Decimal,
        swapInDirection: boolean,
    ): Promise<[string, Decimal]> => {
        const baseTokenMint = new PublicKey(contractAddress);
        const poolKeys = this.findPoolKeys(baseTokenMint, this.quoteTokenMint);
        const [amountOut, amountIn, minAmountOut] = await this.calcAmountOut(
            poolKeys,
            amountToken.toNumber(),
            swapInDirection,
        );
        const userTokenAccounts = await this.getOwnerTokenAccounts();
        const swapTransaction = await Liquidity.makeSwapInstructionSimple({
            connection: this.connection,
            makeTxVersion: 0,
            poolKeys: poolKeys,
            userKeys: {
                tokenAccounts: userTokenAccounts,
                owner: this.wallet.publicKey,
            },
            amountIn: amountIn,
            amountOut: minAmountOut,
            fixedSide: "in",
            config: {
                bypassAssociatedCheck: false,
            },
            computeBudgetConfig: {
                microLamports: config.dex.max_lamports,
            },
        });
        const recentBlockhashForSwap = await this.connection.getLatestBlockhash();
        const instructions = swapTransaction.innerTransactions[0].instructions.filter(Boolean);
        const transaction = new VersionedTransaction(
            new TransactionMessage({
                payerKey: this.wallet.publicKey,
                recentBlockhash: recentBlockhashForSwap.blockhash,
                instructions: instructions,
            }).compileToV0Message(),
        );
        transaction.sign([this.wallet.payer]);
        const txid = await this.connection.sendTransaction(transaction, {
            skipPreflight: true,
            maxRetries: config.dex.max_retries,
        });
        return [txid, new Decimal(amountOut.toFixed())];
    };
}
