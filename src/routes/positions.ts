import { openLongPosition, closeLongPosition } from "controllers/positions";
import { Router } from "express";
import validateSchema from "middlewares/validation";
import { OpenLongRequest, CloseLongRequest } from "schemas/positions";

const router = Router();

router.post("/open_long", validateSchema(OpenLongRequest), openLongPosition);
router.post("/close_long", validateSchema(CloseLongRequest), closeLongPosition);

export const PositionsRouter: Router = router;
