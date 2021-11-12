const got = require('got');
const sqlite3 = require('sqlite3').verbose();

const pages = 5729

let db = new sqlite3.Database('./images.db');

/*
TODO:
- check when image has been taken
- check municipality
*/

let sql = `
CREATE TABLE IF NOT EXISTS Vehicle (
	big_path TEXT,
	thumb_path TEXT,
	municipality TEXT,
	taken DATE,
	name TEXT
);
`;
db.run(sql, [], (err) => {
	if (err) throw err
});

db.close();

const indexImage = async (bigImagePath, thumbImagePath, name) => {
	let db = new sqlite3.Database('./images.db');

	let sql = `INSERT INTO Vehicle (big_path, thumb_path, name) VALUES (?, ?, ?);`;
	db.run(sql, [bigImagePath, thumbImagePath, name], function(err) {
		if (err) throw err
		console.log(`Indexed image: ${name}`)
	});
	
	db.close();
}

const scrapeImagesFromPage = async (id, callback) => {
	try {
		console.log(`Scraping page ${id}`)
		
		const regexpLink = /<img src="(albums\/userpics\/\w+\/\w+\.jpg)"/g;
		const regexpTitle = /<span class="thumb_title thumb_title_title">(.*)<\/span><span class="thumb_title thumb_title_views">/g

		const response = await got(`https://www.fireimages.net/thumbnails.php?album=lastup&page=${id}`);
		const images = [...response.body.matchAll(regexpLink)]
		const titles = [...response.body.matchAll(regexpTitle)]
		images.forEach((image, idx) => {
			const name = titles[idx][1]
			const bigImagePath = `https://www.fireimages.net/${image[1].replace('thumb_', '')}`
			const thumbImagePath = `https://www.fireimages.net/${image[1]}`
			indexImage(bigImagePath, thumbImagePath, name)
		});
		callback(id)
	} catch (error) {
		console.error(error);
		callback(id)
	}
}

const scrapeNextPage = (currentId) => {
	console.log(`Scraped page ${currentId}`)
	if (currentId + 1 <= pages)
		scrapeImagesFromPage(currentId + 1, scrapeNextPage)
}

scrapeImagesFromPage(1, scrapeNextPage)