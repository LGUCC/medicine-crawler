import puppeteer from "puppeteer";
import { v4 as uuidv4 } from 'uuid';
import { exec } from "child_process";

// ======================================== UTIL ==========================================

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const commitChanges = () => exec("bash commit.bash")

commitChanges();
process.exit(0);

// ======================================== UTIL ==========================================

// ****************************************************************************************
// ****************************************************************************************
// ****************************************************************************************

// ======================================== File System ====================================

import fs from "fs";

const PATH = "./data";
const initFS = () => {
  if (!fs.existsSync(PATH)) fs.mkdirSync(PATH);
};
initFS();

const writeFile = (key: string, data: any) => {
  fs.writeFileSync(
    `${PATH}/${key}.json`,
    JSON.stringify(data, null, 2),
    "utf-8",
  );
};

const readFile = (key: string) => {
  return JSON.parse(fs.readFileSync(`${PATH}/${key}.json`, "utf-8"));
};

// ======================================== File System ====================================

const browser = await puppeteer.launch({
  headless: true,
});

const alphabets = Array.from("abcdefghijklmnopqrstuvwxyz");

async function scrapByAlphabet() {
  for (var alphabet of alphabets) {
    const page = await browser.newPage();
    await page.goto(`https://dawaai.pk/all-medicines/${alphabet}`, {
      waitUntil: "networkidle2",
    });
    await page.waitForNetworkIdle();

    const res = await page.evaluate(() => {
      const anchors = Array.from(
        document.querySelectorAll(".card-body a"),
      ) as HTMLAnchorElement[];
      return anchors.map((ele) => ({
        link: ele.href,
        name: ele.textContent,
      }));
    });

    writeFile(alphabet, res);
    await page.close();
    await sleep(2000);
  }
}

export function chunkifyArray<T>(arr: T[], chunks: number) {
  if (chunks <= 0) throw new Error("Number of chunks should be greater than 0");

  const chunkSize = Math.ceil(arr.length / chunks);
  const res: Array<Array<T>> = [];

  for (let i = 0; i < arr.length; i += chunkSize) res.push(arr.slice(i, i + chunkSize));

  return res;
}



import { load } from "cheerio";

async function scrapEachPages() {
  const medicines = alphabets
    .map((alphabet) => readFile(alphabet) as { link: string; name: string }[])
    .flat();
  
  const chunks = chunkifyArray(medicines, Math.ceil(medicines.length / 2));

  const SLEEP_DELAY = 200;
  let leftPages = medicines.length;

  for(let chunk of chunks) {
    await Promise.all(chunk.map(async ({ link })=> {
      const html = await(await fetch(link)).text();
      const $ = load(html);

      const name = $('.product-details h1').text().trim();
      const brand = $('.brand-name a').text().trim();
      const images = $('.picZoomer source').map(function() {
        return $(this).attr('srcset');
      }).get();
      const labels = $('.label').map(function() {
        return $(this).text().trim();
      }).get();
      const generic = $('.generics a').text().trim();
      const description = $('.generics ~ p').text().trim();

      const res = {
        name,
        generic,
        brand,
        images,
        labels,
        description
      };

      console.log(`\n${res.name}, ${res.brand}, ${res.images}, ${res.labels}, ${res.generic}\n\n`);
      writeFile(uuidv4(),  {...res, link, version: '1.0.0', label: 'medicine' });
      console.log(`${leftPages} ~ estimate time can take ${(((leftPages * (SLEEP_DELAY * 1.5)) / 1000) / 60) / 60} hour's`);
      await sleep(SLEEP_DELAY);
      leftPages -= 1;
    }))
  }
}

// await scrapByAlphabet();
browser.close();
await scrapEachPages();
