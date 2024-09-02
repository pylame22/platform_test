import { TableEnum } from "core/db/enums";
import { BaseRepo } from "./base";
import { AssetDoesNotExists } from "utils/exceptions";

export class AssetsRepo extends BaseRepo {
    protected static mainTable = TableEnum.Assets;

    getContractAddress = async (assetId: string): Promise<string> => {
        const asset = await this.trx(TableEnum.Assets).select("contract_address").where({ id: assetId }).first();
        if (!asset) {
            throw new AssetDoesNotExists();
        }
        return asset.contract_address;
    };
}
