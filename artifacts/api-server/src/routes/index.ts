import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import landmateRouter from "./landmate/index.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use("/landmate", landmateRouter);

export default router;
