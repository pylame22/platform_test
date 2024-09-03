import { BN, Wallet } from "@coral-xyz/anchor";
import bs58 from "bs58";
import { WSOL } from "@raydium-io/raydium-sdk";
import {
    Connection,
    Keypair,
    PublicKey,
    TransactionInstruction,
    TransactionMessage,
    VersionedTransaction,
} from "@solana/web3.js";
import Decimal from "decimal.js";
import config from "utils/config";

export type AccountInfoType = {
    owner: PublicKey;
    state: number;
    mint: PublicKey;
    amount: BN;
    delegateOption: number;
    delegate: PublicKey;
    closeAuthority: PublicKey;
    isNativeOption: number;
    isNative: BN;
    delegatedAmount: BN;
    closeAuthorityOption: number;
};

export type TokenAccountType = {
    programId: PublicKey;
    pubkey: PublicKey;

    accountInfo: AccountInfoType;
};

export abstract class BaseDexService {
    static readonly name: string;

    abstract swapToken(
        contractAddress: string,
        amountToken: Decimal,
        swapInDirection: boolean,
    ): Promise<[string, Decimal]>;
}

export abstract class BaseSolanaDexService extends BaseDexService {
    readonly wallet: Wallet;
    readonly connection: Connection;
    quoteTokenMint: PublicKey;

    constructor() {
        super();
        this.wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(config.dex.main_private_key)));
        this.connection = new Connection(config.dex.rpc_url);
        this.quoteTokenMint = new PublicKey(WSOL.mint);
    }

    abstract getAccountInfo(data: Buffer): AccountInfoType;

    getOwnerTokenAccounts = async (tokenProgramId: PublicKey): Promise<TokenAccountType[]> => {
        const walletTokenAccount = await this.connection.getTokenAccountsByOwner(this.wallet.publicKey, {
            programId: tokenProgramId,
        });
        return walletTokenAccount.value.map((i) => ({
            pubkey: i.pubkey,
            programId: i.account.owner,
            accountInfo: this.getAccountInfo(i.account.data),
        }));
    };

    createTransaction = async (blockhash: string, instructions: TransactionInstruction[]): Promise<string> => {
        const transaction = new VersionedTransaction(
            new TransactionMessage({
                payerKey: this.wallet.publicKey,
                recentBlockhash: blockhash,
                instructions: instructions,
            }).compileToV0Message(),
        );
        transaction.sign([this.wallet.payer]);
        return await this.connection.sendTransaction(transaction, {
            skipPreflight: true,
            maxRetries: config.dex.max_retries,
        });
    };
}
