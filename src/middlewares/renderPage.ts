import type { Request, Response } from "express";

interface FilledLocals {
  view: string;
  viewData: object;
}

export default function (_req: Request, res: Response) {
  const { locals } = res;
  assertLocals(locals);
  res.render(locals.view, locals.viewData);
}

function assertLocals(
  locals: Partial<FilledLocals>,
): asserts locals is FilledLocals {
  const { view, viewData } = locals;
  if (!view || typeof view !== "string") {
    console.error("Invalid view: " + JSON.stringify(locals));
    throw new Error("System Error");
  } else if (!viewData) {
    console.error("Invalid viewData: " + JSON.stringify(locals));
    throw new Error("System Error");
  }
}
