import { Router } from "express";
import { PositionsRouter } from "./positions";

const router = Router();

router.use("/positions", PositionsRouter);

export const MainRouter: Router = router;
