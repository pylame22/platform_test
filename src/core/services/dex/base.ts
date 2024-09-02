import { Wallet } from "@coral-xyz/anchor";
import { WSOL } from "@raydium-io/raydium-sdk";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";

export abstract class BaseDexService {
    static readonly name: string;
    readonly wallet: Wallet;
    readonly connection: Connection;
    quoteTokenMint: PublicKey;

    constructor(connection: Connection, wallet: Keypair) {
        this.connection = connection;
        this.wallet = new Wallet(wallet);
        this.quoteTokenMint = new PublicKey(WSOL.mint);
    }

    abstract swapToken(
        contractAddress: string,
        amountToken: Decimal,
        swapInDirection: boolean,
    ): Promise<[string, Decimal]>;
}
