import { Router, type IRouter } from "express";
import healthRouter from "./health";
import weatherRouter from "./weather";
import usersRouter from "./users";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(weatherRouter);
router.use(usersRouter);
router.use(adminRouter);

export default router;
