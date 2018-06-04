const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const url = "https://vnznailandbeautysupplies.co.nz";

function retrieveProduct(data) {
	return new Promise(async resolve => {
		let $ = cheerio.load(data);
		let nextPage = $("ul.pagination > li:last-child > a").attr("href");
		let arr = [];
		$(".product-main-info").each((index, element) => {
			arr.push({
				name: $(element)
					.find(".product-name > a > span")
					.text()
					.trim(),
				price: $(element)
					.find(".oe_currency_value")
					.text()
					.trim()
			});
		});
		if (nextPage != undefined) {
			let res = await axios.get(url + nextPage);
			let nextPageProduct = await retrieveProduct(res.data);
            let result = await arr.concat(nextPageProduct);
			resolve(result);
		} else {
			resolve(arr);
		}
	});
}

function outputToJSON(json, path) {
	let data = JSON.stringify(json);
	fs.writeFile(path, data, "utf8", err => {
		if (err) {
			return console.log(err);
		}
		console.log("The file was saved!");
	});
}

async function main() {
    let json = {};
    let res = await axios.get(url);
	let data = res.data;
	let $ = cheerio.load(data);
	let menu = $(".sub-mainmenu > li > a");
	let menuLength = menu.length;
	let count = 0;
	menu.each(async function(index, element) {
		let title = $(element)
			.find("span")
			.text();
		let res = await axios.get(url + $(element).attr("href"));
		let product = await retrieveProduct(res.data);
		json[title] = product;
		count += 1;
		count == menuLength && outputToJSON(json, "nailData.json");
	});
}

main();
