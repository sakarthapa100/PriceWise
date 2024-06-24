"use server"
import { revalidatePath } from "next/cache"
import Product from "../model/product.model"
import { connectDB } from "../mongoose"
import { scrapeAmazonProduct } from "../scraper"
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils"

export async function scrapeAndStoreProduct(productUrl: string) {
  if (!productUrl) return;

  try {
    await connectDB();
    const scrapeProduct = await scrapeAmazonProduct(productUrl);

    if (!scrapeProduct) return;

    let product = scrapeProduct;
    const existingProduct = await Product.findOne({ url: scrapeProduct.url });

    if (existingProduct) {
      const updatedPriceHistory = [
        ...existingProduct.priceHistory,
        { price: scrapeProduct.currentPrice }
      ];
      product = {
        ...scrapeProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory)
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapeProduct.url },
      product,
      {
        upsert: true,
        new: true
      }
    );
    revalidatePath(`/products/${newProduct._id}`);

  } catch (error) {
    console.error(error);
  }
}

export async function getProductById(productId:String){
  try {
    
    connectDB()
    const product = await Product.findOne({_id:productId})
    if(!product) return null
    return product

  } catch (error) {
    console.log(error)
  }
}
export async function getAllProducts() {
  try {
    connectDB()
    const products = await Product.find()

    return products
  } catch (error) {
    console.log(error)
  }

}

export async function getSimilarProducts(productId:string) {
  try {
    connectDB()
    const currentProduct = await Product.findByIdAndUpdate(productId)
if(!currentProduct) return null

const similarProducts = await Product.find({
  _id:{$ne: productId}
}).limit(3)



    return similarProducts
  } catch (error) {
    console.log(error)
  }

}