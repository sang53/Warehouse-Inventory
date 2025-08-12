import {
  createTables,
  dropTables,
  getAllLocations,
  getAllPallets,
  getAllPPA,
  getAllProducts,
} from "../src/db/queries.ts";
import type { Response, Request } from "express";

export async function indexGet(_req: Request, res: Response) {
  const totals = await Promise.allSettled([
    getAllProducts().then((products) => products.length),
    getAllLocations().then((locations) => locations.length),
    getAllPallets().then((pallets) => pallets.length),
    getAllPPA().then((pallets) =>
      pallets.reduce((stock, curr) => stock + curr.stock, 0),
    ),
  ]).then((totals) => totals.filter((total) => total.status === "fulfilled"));
  res.render("index", {
    products: totals[0]?.value ?? "ERROR",
    locations: totals[1]?.value ?? "ERROR",
    pallets: totals[2]?.value ?? "ERROR",
    stock: totals[3]?.value ?? "ERROR",
  });
}

export async function indexPostReset(_req: Request, res: Response) {
  await dropTables();
  await createTables();
  res.redirect("/");
}
