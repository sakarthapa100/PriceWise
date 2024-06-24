import * as cheerio from 'cheerio';
import axios from 'axios';
import { extractCurrency, extractDescription, extractPrice } from '../utils';

export async function scrapeAmazonProduct(url: string) {
  if (!url) return;

  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;

  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: 'brd.superproxy.io',
    port,
    rejectUnauthorized: false,
  };

  try {
    const response = await axios.get(url, options);
    console.log("Response received");
    const $ = cheerio.load(response.data);
    console.log("Cheerio initialized");

    // Extract the product title
    const title = $('#productTitle').text().trim();
    console.log('Title:', title);

    // Attempt to extract the price with detailed logging
    const priceSelectors = [
      '.priceToPay span.a-price-whole',
      'a.size.base.a-color-price',
      '.a-button-selected .a-color-base',
      '.a-price.a-text-price',
      'a-section a-spacing-none aok-align-center aok-relative',
    ];

    priceSelectors.forEach((selector, index) => {
      const element = $(selector);
      console.log(`Selector ${index + 1}: ${selector}`, element.text().trim());
    });

    const currentPrice = extractPrice(
      $('.priceToPay span.a-price-whole'),
      $('a.size.base.a-color-price'),
      $('.a-button-selected .a-color-base'),
      $('.a-price.a-text-price'),
      $('.a-price-whole.a-price-fraction'),
    );

    const originalPrice = extractPrice(
      $('#priceblock_ourprice'),
      $('.a-price.a-text-price span.a-offscreen'),
      $('#priceblock_dealprice'),
      $('.a-size-base.a-color-price')
    );

    const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

    const images = $('#imgBlkFront').attr('data-a-dynamic-image') ||
      $('#landingImage').attr('data-a-dynamic-image') ||
      '{}';

    const imageUrls = Object.keys(JSON.parse(images));

    const currency = extractCurrency($('.a-price-symbol'));

    const discountRate = $('.savingPercentage').text().replace(/[-%]/g, '');
    const description = extractDescription($);

    // Construct data object with scraped info
    const data = {
      url,
      currency: currency || '$',
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category: 'category',
      reviewsCount: 100,
      stars: 4.5,
      isOutOfStock: outOfStock,
      description,
      lowerPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      average: Number(currentPrice) || Number(originalPrice),
    };
    return data;
    console.log(data);

  } catch (error: any) {
    throw new Error(`Failed to scrape product: ${error.message}`);
  }
}
