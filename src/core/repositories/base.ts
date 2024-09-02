import { Knex } from "knex";
import { TableEnum } from "core/db/enums";

export class BaseRepo {
    protected static mainTable: TableEnum;
    readonly trx: Knex.Transaction;

    constructor(trx: Knex.Transaction) {
        this.trx = trx;
    }

    raw_query = async <T>(query: string, params: Knex.RawBinding, isMany = false): Promise<T> => {
        const response = await this.trx.raw(query, params);
        if (isMany) {
            return response.rows;
        }
        return response.rows[0];
    };
}
