function progressBar(total, percentChar) {
	this.total = total;
	this.current = 0;
	this.percentChar = percentChar;
	this.barLength = process.stdout.columns - 100;
	this.render();
}

progressBar.prototype.setTotal = function(total) {
	this.total = total;
};

progressBar.prototype.update = function(current) {
	this.current++;
	this.render();
};

progressBar.prototype.render = function() {
	if (this.current > this.total) { throw "current value exceed total" };
	let percentageProgress = parseFloat((this.current / this.total).toFixed(2));
	isNaN(percentageProgress) && (percentageProgress = 0);
	let filledBarLength = Math.floor(percentageProgress * this.barLength);
	let filledBar = this.percentChar.repeat(filledBarLength);
	let emptyBar = " ".repeat(this.barLength - filledBarLength);
	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	process.stdout.write(
		`Current progress: [${filledBar}${emptyBar}] | ${percentageProgress *
			100}%`
	);
	percentageProgress == 1 && console.log();
};

module.exports = progressBar;
