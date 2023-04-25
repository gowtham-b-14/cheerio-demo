const dotenv = require("dotenv");
dotenv.config();
const pdfMake = require("pdfmake");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const from_data = require("form-data");

const fonts = {
  Roboto: {
    normal: "fonts/Roboto-Regular.ttf",
    bold: "fonts/Roboto-Medium.ttf",
    italics: "fonts/Roboto-Italic.ttf",
  },
};

const form = new from_data();

const baseurl = "https://reactnative.dev";
const url = "https://reactnative.dev/blog";

const datas = [];
const url_data = [];
const date = [];

export async function getHTML() {
  const { data: html } = await axios.get(url);
  return html;
}
let pdfContent = {
  content: [],
};
getHTML().then((res) => {
  const $ = cheerio.load(res);
  $(".container.margin-vert--lg article > header > h2").each((i, article) => {
    const title = $(article).find(".title_Kdtz a").text();
    datas.push([title]);
  });
  $(".container.margin-vert--lg article > header > h2").each((i, article) => {
    const link = $(article).find(".title_Kdtz a").attr("href");
    url_data.push([`${baseurl}${link}`]);
  });
  $(".container.margin-vert--lg article > header > div").each((i, article) => {
    const dt = $(article)
      .find(".container_iZB2.margin-vert--md > time ")
      .text();
    if (dt.length != 0) {
      date.push(dt);
    }
  });
  fs.writeFile("data.json", JSON.stringify(datas), (err) => {
    if (err) throw err;
  });
  fs.writeFile("url.json", JSON.stringify(url_data), (err) => {
    if (err) throw err;
  });
  fs.writeFile("date.json", JSON.stringify(date), (err) => {
    if (err) throw err;
  });
  for (let i = 0; i < datas.length; i++) {
    pdfContent.content.push([i + 1] + " . " + datas[i] + " . " + "( " + date[i] + " )" + "\n\n");
    pdfContent.content.push(url_data[i] + "\n\n\n");
  }
  const printer = new pdfMake(fonts);
  const pdfDoc = printer.createPdfKitDocument(pdfContent);
  pdfDoc.pipe(fs.createWriteStream("pdfs/test.pdf"));
  pdfDoc.end();
  form.append("toMails", "gowtham200014@gmail.com,gowtham.balu@bounteous.com");
  form.append("subject", "React native blogs");
  form.append(
    "body",
    "Stay ahead of the curve with the latest and greatest React Native blogs! Check out these must-read sources and their URLs."
  );
  form.append("attachment", fs.createReadStream("pdfs/test.pdf"));
  axios
    .post(process.env.API_ENDPOINT, form)
    .then((response) => {
      console.log("response", response.data);
    })
    .catch((error) => {
      console.log(error);
    });
});
