const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs")
const url = "https://vnznailandbeautysupplies.co.nz";

var json = {}

function retrieveProduct(data) {
  let $ = cheerio.load(data);
  let nextPage = $("ul.pagination > li:last-child > a").attr("href")
  console.log($(".product-name").text())
  if(nextPage){
    axios.get(url+nextPage).then(res => retrieveProduct(res.data))
  }
}

axios.get(url).then(res => {
  let $ = cheerio.load(res.data);
  $(".sub-mainmenu > li > a").each((index, element) => {
    axios
      .get(url + $(element).attr("href"))
      .then(res => retrieveProduct(res.data))
  });
});

fs.writeFile('myjsonfile.json', json, 'utf8');