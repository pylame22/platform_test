import { z } from "zod";
import { zodDecimalType } from "./base.js";

export const OpenLongRequest = z.object({
    user_id: z.string().uuid(),
    asset_id: z.string().uuid(),
    amount_token: zodDecimalType(5),
});

export const CloseLongRequest = z.object({
    user_id: z.string().uuid(),
    asset_id: z.string().uuid(),
    amount_token: zodDecimalType(5),
});
