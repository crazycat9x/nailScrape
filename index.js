const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const url = "https://vnznailandbeautysupplies.co.nz";

var json = {};

function retrieveProduct(data) {
  return new Promise(async resolve => {
    let $ = cheerio.load(data);
    let nextPage = $("ul.pagination > li:last-child > a").attr("href");
    let arr = [];
    $(".product-name").each((index, element) => {
      arr.push(
        $(element)
          .text()
          .trim()
      );
    });
    if (nextPage != undefined) {
      let res = await axios.get(url + nextPage);
      let nextPageProduct = await retrieveProduct(res.data)
      let result = await arr.concat(nextPageProduct);
      resolve(result);
    } else {
      resolve(arr);
    }
  });
}

async function main() {
  let res = await axios.get(url);
  let data = res.data;
  let $ = cheerio.load(data);
  let menu = $(".sub-mainmenu > li > a");
  menu.each(async function(index, element) {
    let res = await axios.get(url + $(element).attr("href"));
    let product = await retrieveProduct(res.data);
    console.log(product)
  });
}

main();

// fs.writeFile("myjsonfile.json", json, "utf8");
