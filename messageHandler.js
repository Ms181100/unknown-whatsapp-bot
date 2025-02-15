// https://github.com/Ms181100/unknown-whatsapp-bot2/new/master

const fs = require("fs");

const axios = require("axios");

const PDFDocument = require("pdfkit");

const brainly = require("brainly-scraper");

const tesseract = require("node-tesseract-ocr");

const webpConverter = require("./lib/webpconverter.js")

const bahasa_planet = require('./lib/bahasa_planet')

const WSF = require("wa-sticker-formatter");

const { MessageType, Mimetype } = require("@adiwajshing/baileys");

const inPdfInput = [];

const questionAnswer = {};

const bufferImagesForPdf = {};

const quotesList = JSON.parse(fs.readFileSync("lib/quotes.json", "utf-8"));

const factList = JSON.parse(fs.readFileSync("lib/fact.json", "utf-8"));

module.exports = async (conn, message) => {

	const senderNumber = message.key.remoteJid;	const imageMessage = message.message.imageMessage;

	const videoMessage = message.message.videoMessage;

	const stickerMessage = message.message.stickerMessage;

	const extendedTextMessage = message.message.extendedTextMessage;

	const quotedMessageContext = extendedTextMessage && extendedTextMessage.contextInfo && extendedTextMessage.contextInfo;

	const quotedMessage = quotedMessageContext && quotedMessageContext.quotedMessage;

	const textMessage = message.message.conversation || message.message.extendedTextMessage && message.message.extendedTextMessage.text || imageMessage && imageMessage.caption || videoMessage && videoMessage.caption

	let command, parameter;

	if (textMessage) {

		// command = textMessage.trim().split(" ")[0];

		// parameter = textMessage.trim().split(" ").slice(1).join(" ");

		let a = textMessage.trim().split("\n");

		let b = "";

		command = a[0].split(" ")[0];

		b += a[0].split(" ").slice(1).join(" ");

		b += a.slice(1).join("\n")

		parameter = b.trim();

	}

	if (inPdfInput.includes(senderNumber)) {

		if (stickerMessage) return;

		if (command == "!done" || bufferImagesForPdf[senderNumber].length > 19) {

			const pdf = new PDFDocument({ autoFirstPage:false });

			const bufferImages = bufferImagesForPdf[senderNumber];

			for (const bufferImage of bufferImages) {

				const image = pdf.openImage(bufferImage);

				pdf.addPage({ size:[image.width, image.height] });

				pdf.image(image, 0, 0);

			}

			const pathFile = ".temp/" + Math.floor(Math.random() * 1000000 + 1) + ".pdf";

			const file = fs.createWriteStream(pathFile);

			pdf.pipe(file)

			pdf.end()

			file.on("finish", () => {

				const file = fs.readFileSync(pathFile);

				conn.sendMessage(senderNumber, file, MessageType.document, { mimetype: Mimetype.pdf, filename: Math.floor(Math.random() * 1000000) + ".pdf", quoted: message});

				fs.unlinkSync(pathFile);

				inPdfInput.splice(inPdfInput.indexOf(senderNumber), 1);

				delete bufferImagesForPdf[senderNumber];

			})

		} else if (command == "!cancel") {

			delete bufferImagesForPdf[senderNumber];

			inPdfInput.splice(inPdfInput.indexOf(senderNumber), 1);

			conn.sendMessage(senderNumber, "Operasi dibatalkan!", MessageType.text, { quoted: message })

		} else if (imageMessage && imageMessage.mimetype == "image/jpeg") {

			const bufferImage = await conn.downloadMediaMessage(message);

			bufferImagesForPdf[senderNumber].push(bufferImage);

			conn.sendMessage(senderNumber, `[${bufferImagesForPdf[senderNumber].length}] Sukses menambah gambar!, kirim *!done* jika selesai, *!cancel* jika ingin membatalkan`, MessageType.text, { quoted: message })

			

		} else {

			conn.sendMessage(senderNumber, "Itu bukan gambar! kirim *!done* jika selesai, *!cancel* jika ingin membatalkan", MessageType.text, { quoted: message })

		}

		return;

	}

	switch (command) {

		case "!help":

		{

			const text = `Hallo, herzlich willkommen*${conn.user.name}*!

- sende *!help*, um die Liste der Befehle dieses Bots anzuzeigen

- Senden Sie *!contact*, um den Bot-Ersteller zu kontaktieren

- sende ein Bild mit der Überschrift *!sticker*, um einen Sticker zu erstellen

- Senden Sie ein Bild mit der Überschrift *!stickernobg*, um einen Aufkleber ohne Hintergrund zu erstellen

- Senden Sie *!pdf*, um ein PDF aus Bildern zu erstellen

- Antworten Sie auf den Aufkleber mit der Überschrift *!toimg*, um einen Aufkleber zum Bild zu machen

- Antworten Sie auf den Aufkleber bewegt sich mit der Überschrift *!togif*, um den Aufkleber zu einem Gif zu machen

- sende *!textsticker [deinen Text]*, um einen Textsticker zu erstellen

  Beispiel: !Textsticker ist Sticker

- Senden Sie *!giftextsticker [Ihren Text]*, um einen Textaufkleber zu erstellen

  Beispiel: !giftextsticker ist ein Sticker

- sende ein Video mit der Überschrift *!gifsticker*, damit sich der Sticker bewegt

- sende *!write [Text hier einfügen]*, um auf Papier zu schreiben

  Beispiel: !schreibe dies mein Schreiben

- Senden Sie *!brainly [Ihre Frage]*, um auf brainly nach Fragen und Antworten zu suchen

  Beispiel: !Gehirn was ist nodejs

- *!quotes* um Angebote zu erhalten

- *!randomfact*, um zufälliges Wissen zu erhalten

- *!gtts [Sprachcode] [Text]* zum Konvertieren von Text in Google Voice. Für Sprachcode siehe hier https://s.id/xSj1g

   Beispiel: !gtts meine ID ist bot

- *!wikipedia [query]* zum Suchen und Lesen von Artikeln auf Wikipedia

   Beispiel: !wikipedia Python

- *!mathe*, um mathematische Probleme zu lösen

- *!bplanet [auch bekannt als] [Text]*

   Beispiel: !bplanet g was machst du?

- Bild mit Bildunterschrift *!ocr* senden, um Text aus dem Bild zu erhalten

Bot sensitif terhadap simbol / spasi / huruf kecil / huruf besar jadi, bot tidak akan membalas jika terjadi kesalahan penulisan!

Bot ini open source loh! kakak bisa cek di https://github.com/salismazaya/whatsapp-bot (jika ingin mengedit mohon untuk tidak hilangankan link ini)

apa? mau traktir aku? boleh banget https://saweria.co/salismazaya`.replace("(jika ingin mengedit mohon untuk tidak hilangankan link ini)", "");

			conn.sendMessage(senderNumber, text, MessageType.text, { quoted: message });

			break;

		}

		case "!contact":

		{

			const text = `Hubungi saya di

- Facebook: fb.me/salismazaya

- Telegram: t.me/salismiftah

- Email: salismazaya@gmail.com`;

			conn.sendMessage(senderNumber, text, MessageType.text, { quoted: message });

			break;

		}

		case "!sticker":

		case "!stiker":

		{

			if (quotedMessage) {

				message.message = quotedMessage;

			}

			if (!message.message.imageMessage || message.message.imageMessage.mimetype != "image/jpeg") {

				conn.sendMessage(senderNumber, "Tidak ada gambar :)", MessageType.text, { quoted: message });

				break;

			}

			const imagePath = await conn.downloadAndSaveMediaMessage(message, Math.floor(Math.random() * 1000000));

			const sticker = new WSF.Sticker("./" + imagePath, { crop: false, pack: "i hope you fine :)", author: 'Sugito Tempest' });

			await sticker.build();

			fs.unlinkSync(imagePath);

			const bufferImage = await sticker.get();

			conn.sendMessage(senderNumber, bufferImage, MessageType.sticker, { quoted: message });

			break;

		}

		case "!toimg":

		{

			if (!quotedMessage || !quotedMessage.stickerMessage || quotedMessage.stickerMessage.mimetype != "image/webp") {

				conn.sendMessage(senderNumber, "Harus me-reply sticker :)", MessageType.text, { quoted: message });

				break;

			}

			message.message = quotedMessage;

			const webpImage = await conn.downloadMediaMessage(message);

			const jpgImage = await webpConverter.webpToJpg(webpImage);

			conn.sendMessage(senderNumber, jpgImage, MessageType.image, { quoted: message, caption: "Ini gambarnya kak!" });

			break;

		}

		

		case "!togif":

		{

			if (!quotedMessage || !quotedMessage.stickerMessage || quotedMessage.stickerMessage.mimetype != "image/webp") {

				conn.sendMessage(senderNumber, "Harus me-reply sticker :)", MessageType.text, { quoted: message });

				break;

			}

			message.message = quotedMessage;

			const webpImage = await conn.downloadMediaMessage(message);

			const video = await webpConverter.webpToVideo(webpImage);

			conn.sendMessage(senderNumber, video, MessageType.video, { quoted: message, mimetype: Mimetype.gif });

			break;

		}

		case "!write":

		case "!nulis":

		{

			if (!parameter) {

				conn.sendMessage(senderNumber, "Tidak ada text :)", MessageType.text, { quoted: message });

				break;

			}

			const response = await axios.post("https://salism3api.pythonanywhere.com/write", { "text": parameter });

			const imagesUrl = response.data.images.slice(0, 4);

			for (const imageUrl of imagesUrl) {

				const response = await axios({

					url: imageUrl,

					method: "GET",

					responseType: "arraybuffer",

				});

				const image = Buffer.from(response.data, "binary");

				await conn.sendMessage(senderNumber, image, MessageType.image, { quoted: message });

			}

			break;

		}

		case "!pdf":

		{

			if (message.participant) {

				conn.sendMessage(senderNumber, "Fitur ini tidak bisa berjalan di grup :(", MessageType.text, { quoted: message });

				break;

			}

			if (imageMessage) {

				conn.sendMessage(senderNumber, "Kirim tanpa gambar!", MessageType.text, { quoted: message });

				break;

			}

			inPdfInput.push(senderNumber);

			bufferImagesForPdf[senderNumber] = [];

			conn.sendMessage(senderNumber, "Silahkan kirim gambarnya satu persatu! jangan spam ya!", MessageType.text, { quoted: message });

			break;

		}

		case "!brainly":

		{

			if (!parameter) {

				conn.sendMessage(senderNumber, "Inputnya salah kak :)", MessageType.text, { quoted: message });

				break;

			}

			const data = await brainly(parameter);

			if (data.succses && data.data.length <= 0) {

				conn.sendMessage(senderNumber, "Pertanyaan tidak ditemukan :(", MessageType.text, { quoted: message })

			} else if (data.success) {

				for (const question of data.data.slice(0, 3)) {

					const text = `*Pertanyaan:* ${question.pertanyaan.trim()}\n\n*Jawaban*: ${question.jawaban[0].text.replace("Jawaban:", "").trim()}`

					await conn.sendMessage(senderNumber, text, MessageType.text, { quoted: message })

				}

			}

			break;

		}

		case "!quotes":

		{

			const quotes = quotesList[Math.floor(Math.random() * quotesList.length)];

			const text = `_"${quotes.quote}"_\n\n - ${quotes.by}`;

			conn.sendMessage(senderNumber, text, MessageType.text, { quoted: message });

			break;

		}

		case "!randomfact":

		case "!fact":

		{

			const fact = factList[Math.floor(Math.random() * factList.length)];

			const text = `_${fact}_`

			conn.sendMessage(senderNumber, text, MessageType.text, { quoted: message });

			break;

		}

		case "!gtts":

		case "!tts":

		case "!text2sound":

		{

			if (!parameter) {

				conn.sendMessage(senderNumber, "Inputnya salah kak :)", MessageType.text, { quoted: message });

				break;

			}

			if (parameter.split(" ").length == 1) {

				conn.sendMessage(senderNumber, "Tidak ada kode bahasa / teks", MessageType.text, { quoted: message });

				break;

			}

			const language = parameter.split(" ")[0];

			const text = parameter.split(" ").splice(1).join(" ");

			axios({

				url: `https://salism3api.pythonanywhere.com/text2sound`,

				method: "POST",

				responseType: "arraybuffer",

				data: {

					"languageCode": language,

					"text": text,

				}

			}).then(response => {

				const audio = Buffer.from(response.data, "binary");

				conn.sendMessage(senderNumber, audio, MessageType.audio, { ptt: true, quoted: message });

			}).catch(response => {

				conn.sendMessage(senderNumber, `Kode bahasa *${language}* tidak ditemukan :(`, MessageType.text, { quoted: message });

			});

			break;

		}

		case "!wikipedia":

		case "!wiki":

		{

			if (!parameter) {

				conn.sendMessage(senderNumber, "Inputnya salah kak :)", MessageType.text, { quoted: message });

				break;

			}

			axios.post("http://salism3api.pythonanywhere.com/wikipedia", { "query":parameter })

				.then(response => {

					const text = `*${response.data.title}*\n\n${response.data.content}`;

					conn.sendMessage(senderNumber, text, MessageType.text, { quoted: message });

				})

				.catch(e => {

					if ([ 500, 400, 404 ].includes(e.response.status)) {

						conn.sendMessage(senderNumber, `Artikel tidak ditemukan :(`, MessageType.text, { quoted: message });

					} else {

						throw e;

					}

				})

			break;

		}

		case "!textsticker":

		case "!textstiker":

		{

			if (!parameter) {

				conn.sendMessage(senderNumber, "Inputnya salah kak :)", MessageType.text, { quoted: message });

				break;

			}

			const response = await axios.post("https://salism3api.pythonanywhere.com/text2img", { "text":parameter.slice(0,60) });

			const sticker = new WSF.Sticker(response.data.image, { crop: false, pack: "i hope you fine :)", author: 'Sugito Tempest' });

			await sticker.build();

			const bufferImage = await sticker.get();

			conn.sendMessage(senderNumber, bufferImage, MessageType.sticker, { quoted: message });

			break;

		}

		case "!ocr":

		{

			if (quotedMessage) {

				message.message = quotedMessage;

			}

			if (!message.message.imageMessage || message.message.imageMessage.mimetype != "image/jpeg") {

				conn.sendMessage(senderNumber, "Tidak ada gambar :)", MessageType.text, { quoted: message });

				break;

			}

			const imagePath = await conn.downloadAndSaveMediaMessage(message, Math.floor(Math.random() * 1000000));

			const textImage = (await tesseract.recognize(imagePath)).trim();

			fs.unlinkSync(imagePath)

			conn.sendMessage(senderNumber, textImage, MessageType.text, { quoted: message });		

			break;

		}

		case "!gifsticker":

		{

			if (quotedMessage) {

				message.message = quotedMessage;

			}

			if (!message.message.videoMessage || message.message.videoMessage.mimetype != "video/mp4") {

				conn.sendMessage(senderNumber, "Tidak ada video :)", MessageType.text, { quoted: message });

				break;

			}

			if (message.message.videoMessage.seconds > 8) {

				conn.sendMessage(senderNumber, "Maksimal 8 detik!", MessageType.text, { quoted: message });

				break;	

			}

			const imagePath = await conn.downloadAndSaveMediaMessage(message, Math.floor(Math.random() * 1000000));

			const sticker = new WSF.Sticker("./" + imagePath, { animated: true, pack: "i hope you fine :)", author: 'Sugito Tempest' });

			await sticker.build();

			fs.unlinkSync(imagePath);

			const bufferImage = await sticker.get();

			conn.sendMessage(senderNumber, bufferImage, MessageType.sticker, { quoted: message });

			break;

		}

		case "!giftextsticker":

		{

			if (!parameter) {

				conn.sendMessage(senderNumber, "Inputnya salah kak :)", MessageType.text, { quoted: message });

				break;

			}

			const response = await axios.post("https://salism3api.pythonanywhere.com/text2gif/", { "text":parameter.slice(0,60) });

			let image = await axios.get(response.data.image, { "responseType":"arraybuffer" });

			image = Buffer.from(image.data, "binary");

			image = await webpConverter.gifToWebp(image);

			conn.sendMessage(senderNumber, image, MessageType.sticker, { quoted: message });

			break;	

		}

		case "!math":

		{

			const response = await axios.get("https://salism3api.pythonanywhere.com/math/");

			let image = await axios.get(response.data.image, { "responseType":"arraybuffer" });

			image = Buffer.from(image.data, "binary");

			const msg = await conn.sendMessage(senderNumber, image, MessageType.image, { quoted: message, caption: "Balas pesan ini untuk menjawab!"});

			questionAnswer[msg.key.id] = response.data.answer;

			setTimeout(() => {

				if (questionAnswer[msg.key.id]) {

					conn.sendMessage(senderNumber, "Waktu habis!", MessageType.text, { quoted: msg });

					delete questionAnswer[msg.key.id];

				}

			}, 600 * 1000);

			break;

		}

		case "!stickernobg":

		case "!stikernobg":

		case "!snobg":

		{

			if (quotedMessage) {

				message.message = quotedMessage;

			}

			if (!message.message.imageMessage || message.message.imageMessage.mimetype != "image/jpeg") {

				conn.sendMessage(senderNumber, "Tidak ada gambar :)", MessageType.text, { quoted: message });

				break;

			}

			const image = await conn.downloadMediaMessage(message);

			const imageb64 = image.toString('base64')

			conn.sendMessage(senderNumber, 'Tunggu ya kak!', MessageType.text);

			const data = await axios.post('https://salisganteng.pythonanywhere.com/api/remove-bg', {

				'api-key': 'salisheker',

				'image': imageb64,

			})

			const sticker = new WSF.Sticker(data.data.image, { crop: false, pack: "i hope you fine :)", author: 'Sugito Tempest' });

			await sticker.build();

			const bufferImage = await sticker.get();

			conn.sendMessage(senderNumber, bufferImage, MessageType.sticker, { quoted: message });

			break;

		}

                /**

                 * Konversi bahasa planet

                 * use: !bplanet g kamu lagi ngapain

                 * result: kagamugu lagagigi ngagapagaigin

                 **/

                case '!bplanet':

                    if (quotedMessage) message.message = quotedMessage

                    if (!!parameter) {

                        var [ alias, ...text ] = parameter.split` `

                        text = text.join` `

                        conn['sendMessage'](senderNumber, bahasa_planet(text, alias), 'conversation', {

                            quoted: message

                        })

                    } else {

                        var contoh = '[wrong format]\n\nformat: !bplanet <alias> <text>\ncontoh: !bplanet g kamu lagi ngapain?'

                        conn['sendMessage'](senderNumber, contoh, 'conversation', {

                            quoted: message

                        })

                    }

                    break

		default:

		{

			if (quotedMessage && questionAnswer[quotedMessageContext.stanzaId] && textMessage) {

				const answer = questionAnswer[quotedMessageContext.stanzaId];

				if (answer == parseInt(textMessage)) {

					conn.sendMessage(senderNumber, "Keren! jawaban benar", MessageType.text, { quoted: message });

					delete questionAnswer[quotedMessageContext.stanzaId];

				} else {

					conn.sendMessage(senderNumber, "Jawaban salah!", MessageType.text, { quoted: message })

				}

			} else if (!message.participant && !stickerMessage) {

				conn.sendMessage(senderNumber, "Command tidak terdaftar, kirim *!help* untuk melihat command terdaftar", MessageType.text, { quoted: message });

			}

		}

	}

}
