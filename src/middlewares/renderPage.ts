import type { Request, Response } from "express";
import { FilledLocals, VIEWS } from "../config/viewConfig.ts";

export default function (_req: Request, res: Response) {
  const { locals } = res;
  assertFilledLocals(locals);
  res.render(locals.view, locals.viewData);
}

function assertFilledLocals(
  locals: Partial<FilledLocals>,
): asserts locals is FilledLocals {
  const { view, viewData } = locals;
  if (!view || !Object.values(VIEWS).includes(view)) {
    console.error("Invalid view: " + JSON.stringify(locals));
    throw new Error("System Error");
  } else if (!viewData) {
    console.error("Invalid viewData: " + JSON.stringify(locals));
    throw new Error("System Error");
  }
}
