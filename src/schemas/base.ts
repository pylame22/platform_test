import { z } from "zod";
import Decimal from "decimal.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const zodDecimalType = (precision: number): z.ZodEffects<any, any, any> =>
    z
        .string()
        .transform((val) => new Decimal(val))
        .refine((val) => val.isPositive(), {
            message: "Value must be a positive decimal number",
        })
        .refine((val) => val.decimalPlaces() <= precision, {
            message: `Value must have at most ${precision} decimal places`,
        })
        .transform((val) => val);
