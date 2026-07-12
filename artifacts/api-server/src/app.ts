import express, { type Express, type RequestHandler } from "express";
import type { IncomingMessage, ServerResponse } from "node:http";
import cors from "cors";
import * as pinoHttpModule from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

type PinoHttpFactory = (options: {
  logger: typeof logger;
  serializers: {
    req(req: IncomingMessage & { id?: string }): Record<string, unknown>;
    res(res: ServerResponse): Record<string, unknown>;
  };
}) => RequestHandler;

const pinoHttpImport = pinoHttpModule as unknown as PinoHttpFactory & {
  default?: PinoHttpFactory;
};
const pinoHttp = pinoHttpImport.default ?? pinoHttpImport;

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: IncomingMessage & { id?: string }) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: ServerResponse) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
