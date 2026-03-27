import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import landmateRouter from "./landmate/index.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/landmate", landmateRouter);

export default router;
