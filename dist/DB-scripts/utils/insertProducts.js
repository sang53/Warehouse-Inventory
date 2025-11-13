import Product from "../../models/productsModel.js";
const testProducts = [
    "Victoria Bitter",
    "Vodka Cruiser",
    "West Coast",
    "Little Fat Lamb",
    "Cass",
    "Corona",
    "Kloud",
    "Somersby Apple Cider",
    "Heineken Lager Beer",
    "Hahn Super Dry",
];
export default async function (client) {
    return await Promise.all(testProducts.map((p_name) => Product.create({ p_name }, client)));
}
