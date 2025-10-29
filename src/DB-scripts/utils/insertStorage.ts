import Pallet, { ProductPallet } from "../../models/palletsModel.ts";
import Location from "../../models/locationsModel.ts";
import { PoolClient } from "pg";
import randInt from "./randInt.ts";

interface ProductStock {
  p_id: number;
  stock: number;
}

const STOCK_RANGE = [5, 20] as const;
const MAX_TOTAL = 500;
const MAX_PALLET = 50;

export default async function (client: PoolClient, pIds: number[]) {
  const storageData = getStorageData(pIds);

  const paIds = await createPallets(storageData.length, client);
  const palletStorageData = getPalletStorageData(storageData, paIds);

  // add products to pallets & move to storage location
  await ProductPallet.modifyProducts(palletStorageData, client, "+");
  await setPalletLocations(paIds, client);
}

// returns products & stocks grouped into pallets
function getStorageData(pIds: number[]) {
  let storageData: ProductStock[][] = [];
  let storageTotal = 0;

  do {
    const productStocks = getProductStocks(pIds);
    const { groupStockTotal, groupedProducts } =
      groupIntoPallets(productStocks);

    storageTotal += groupStockTotal;
    storageData = storageData.concat(groupedProducts);
  } while (storageTotal < MAX_TOTAL);

  return storageData;
}

// returns products & randomised stocks in random order
function getProductStocks(pIds: number[]) {
  const productStocks = getShuffled(pIds);

  return productStocks.map((p_id: number) => ({
    p_id,
    stock: randInt(STOCK_RANGE[1], STOCK_RANGE[0]),
  }));
}

function groupIntoPallets(productStocks: ProductStock[]) {
  const groupedProducts: ProductStock[][] = [];
  let currPallet: ProductStock[] = [];
  let palletTotal = 0;
  let groupStockTotal = 0;
  const seenPID = new Set<number>();

  for (const productStock of productStocks) {
    if (seenPID.has(productStock.p_id) || palletTotal > MAX_PALLET) {
      // if stock on current pallet > max:
      // add current pallet to data & reset to new pallet
      groupedProducts.push(currPallet);
      currPallet = [];

      // update overall total & reset pallet stock count
      groupStockTotal += palletTotal;
      palletTotal = 0;
      seenPID.clear();
    }
    // add product & stock to current pallet
    currPallet.push(productStock);
    palletTotal += productStock.stock;
    seenPID.add(productStock.p_id);
  }
  if (palletTotal) {
    groupedProducts.push(currPallet);
    groupStockTotal += palletTotal;
  }
  return { groupStockTotal, groupedProducts };
}

async function createPallets(numPallets: number, client: PoolClient) {
  const pallets = await Promise.all(
    Array.from({ length: numPallets }).map(() => Pallet.create(client)),
  );
  return pallets.map(({ pa_id }) => pa_id);
}

function getPalletStorageData(storageData: ProductStock[][], paIds: number[]) {
  if (paIds.length !== storageData.length)
    throw new Error("Incorrect number of pallets created");

  return storageData.flatMap((productStocks, idx) =>
    productStocks.map((productStock) => ({
      ...productStock,
      pa_id: paIds[idx] ?? 1,
    })),
  );
}

async function setPalletLocations(paIds: number[], client: PoolClient) {
  const storageLocations = await Location.get(
    { l_role: "storage" },
    paIds.length,
    client,
  );
  await Promise.all(
    storageLocations.map(({ l_id }, idx) =>
      Location.movePallet(paIds[idx] ?? 0, l_id, client),
    ),
  );
}

// returns randomly ordered shallow copy of arr
function getShuffled<T>(arr: T[]) {
  const newArr = arr.slice(0);
  for (let i = 1; i < newArr.length; i++) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[j], newArr[i]] = [newArr[i] as T, newArr[j] as T];
  }
  return newArr;
}
