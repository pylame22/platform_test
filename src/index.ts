import express from "express";
import "express-async-errors";
import config from "utils/config";
import bodyParser from "body-parser";
import { MainRouter } from "routes";
import { exceptionMiddleware } from "middlewares/exceptions";

const app = express();

app.use(bodyParser.json());
app.use("/api", MainRouter);
app.use(exceptionMiddleware);

app.listen(config.app_port, config.app_host, () => {
    console.log(`server running on ${config.app_host}:${config.app_port}`);
}).on("error", (e) => console.log(e));
