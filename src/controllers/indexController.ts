import type { Response, Request, NextFunction } from "express";
import getDisplayLocals from "../utils/getLocals/getDisplayLocals.ts";

export const indexGet = [
  (_req: Request, res: Response, next: NextFunction) => {
    res.locals = getDisplayLocals({
      title: "Index",
      tableData: [],
    });
    next();
  },
];
