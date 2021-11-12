const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./images.db');

const token = '1929943840:AAHoC_fUQIbwyLweXFipkdUVtuLLQ7QVAI0';

const bot = new TelegramBot(token, { polling: true });

bot.on("inline_query", (query) => {
    const search = "%" + query.query.replace(" ", "%") + "%";

    let sql = `SELECT ROWID as rowid, big_path, thumb_path FROM Vehicle WHERE name LIKE ? LIMIT 10`;

    let images = [];

    db.all(sql, [search], (err, rows) => {
        if (err) throw err;
        console.log(`${rows.length} for "${search}"`)
        rows.forEach((row) => {
            images.push({
                'type': 'photo', 
                'photo_url': row.big_path,
                'thumb_url': row.thumb_path,
                'id': row.rowid,
                'photo_width': 128,
                'photo_height': 128
            })
        });

        bot.answerInlineQuery(query.id, images);
    });

    console.log(`Someone ran query "${search}"`)
});

