const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const url = "https://vnznailandbeautysupplies.co.nz";
const progressBar = require("./progressBar");

// this is a recursive asynchronous function, please edit with care
function retrieveProducts(data) {
  // function will return a promise that products will be retrieved
  return new Promise(async resolve => {
    const $ = cheerio.load(data);
    // the product category page is paginated so we must get the link to next page
    // will return undefined if next page doesnt exist
    const nextPage = $("ul.pagination > li:last-child > a").attr("href");
    const productArr = [];
    // for each product, add its infos to the array
    $(".product-main-info").each((index, element) => {
      productArr.push({
        // get the product name
        name: $(element)
          .find(".product-name > a > span")
          .text()
          .trim(),
        // get the product price
        price: $(element)
          .find(".oe_currency_value")
          .text()
          .trim()
      });
    });
    // check if there exist next page
    if (nextPage != undefined) {
      // get html of next page
      const res = await axios.get(url + nextPage);
      // make recursive call to get products infos of all remaining pages
      const nextPageProduct = await retrieveProducts(res.data);
      // concatinate the product infos of this page with the remaining pages
      const result = productArr.concat(nextPageProduct);
      // resolve the promise by returning the result
      resolve(result);
    } else {
      // if there is no other pages then resolve the promise by returning the product infos of this page
      resolve(productArr);
    }
  });
}

function outputToJSON(json, path) {
  const data = JSON.stringify(json);
  fs.writeFile(path, data, "utf8", err => {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
}

// immediately-invoked function expression (IIFE)
void (async function main() {
  const json = {};
  const res = await axios.get(url);
  // get homepage html
  const data = res.data;
  const $ = cheerio.load(data);
  // get all links of product categories & number of links
  const categories = $(".sub-mainmenu > li > a");
  const categoriesLength = categories.length;
  // initialize terminal progress bar
  const progress = new progressBar(categoriesLength, "=");
  // counter for numbers of links scraped
  let count = 0;
  categories.each(async function(index, element) {
    const category = $(element)
      .find("span")
      .text();
    // get the html of the product category page
    const res = await axios.get(url + $(element).attr("href"));
    // pass the page to retrieveProducts function and wait for the retrieval of products
    const products = await retrieveProducts(res.data);
    json[category] = products;
    count += 1;
    // increment progress
    progress.update();
    // if all link have been scraped then write to JSON file
    count == categoriesLength && outputToJSON(json, "nailData.json");
  });
})();
