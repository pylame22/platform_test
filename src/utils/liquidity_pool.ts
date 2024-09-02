import { LiquidityPoolJsonInfo, WSOL } from "@raydium-io/raydium-sdk";
import { database } from "core/db/knex";
import fs from "fs";

type LiquidityPool = LiquidityPoolJsonInfo & { lookupTableAccount: string };

export const trimMainnetJson = async (): Promise<void> => {
    const assets = await database("assets").select("contract_address");
    const mainnetData = JSON.parse(fs.readFileSync("mainnet.json", "utf-8"));
    const filteredPools = mainnetData.official.filter((pool: LiquidityPool) => {
        return assets.some(
            (asset) =>
                (pool.baseMint === asset.contract_address && pool.quoteMint === WSOL.mint) ||
                (pool.quoteMint === asset.contract_address && pool.baseMint === WSOL.mint),
        );
    });
    fs.writeFileSync("trimmed_mainnet.json", JSON.stringify(filteredPools, null, 2));
    await database.destroy();
};

const loadtrimmedMainnetJson = (): LiquidityPool[] => {
    return JSON.parse(fs.readFileSync("trimmed_mainnet.json", "utf-8"));
};

export const trimmedMainnetJson = loadtrimmedMainnetJson();
