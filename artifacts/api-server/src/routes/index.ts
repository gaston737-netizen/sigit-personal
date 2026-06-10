import { Router, type IRouter } from "express";
import healthRouter from "./health";
import interconsultasRouter from "./interconsultas";
import dashboardRouter from "./dashboard";
import configuracionRouter from "./configuracion";

const router: IRouter = Router();

router.use(healthRouter);
router.use(interconsultasRouter);
router.use(dashboardRouter);
router.use(configuracionRouter);

export default router;
