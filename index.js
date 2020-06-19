const puppeteer = require('puppeteer');
const fs = require('fs');
const download = require('image-downloader');

const pageURL = 'https://domtkani.com.ua/category/hlopchatobumagnye-tkani-45?p='
const a = 'div.item-pic > a';
const img = 'body > div.my-new-wrapp > div.container > div > div > article > div > div:nth-child(1) > div.img-side > div.content-img-prod- > div.img-prod > a > img';
const navigation = 'a.pgn-next';
let indexPage = 1;
let index = 1;
let nextPage;
async function Get(url){
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    try {
        await page.goto(url);
        console.log('\x1b[32m%s\x1b[0m','Открываю страницу: ', url);
    } catch {
        console.log('\x1b[31m%s\x1b[0m','Не удалось открыть страницу: ',url);
    }
    do{
        nextPage = await page.$$eval(
            navigation, next => next.map(link => link.href)
        );
        let postUrls = await page.$$eval(
            a, postLinks => postLinks.map(link => link.href)
        );
        for (let postUrl of postUrls) {                
            try {
              await page.goto(postUrl);             
              console.log('\x1b[32m%s\x1b[0m','Открываю страницу: ',postUrl);         
            } catch (error) {                      
              console.log('\x1b[31m%s\x1b[0m','Не удалось открыть страницу: ',postUrl);         
            }
            let urlImg = await page.$$eval(
                img, srcImg => srcImg.map(image => image.src)
            );
            let options = {
                url: urlImg[0],
                dest: './images/'+index.toString()+'.jpg'         
            }
            download.image(options);
            try {
                let jsonString = fs.readFileSync('./info.json')
                let json = JSON.parse(jsonString);
                json[index.toString()] = postUrl;
                fs.writeFileSync('./info.json', JSON.stringify(json));
                console.log('\x1b[33m%s\x1b[0m','Информация добавлена')
            } catch(err) {
                console.log(err)
            }
            index++;
        }
        try {
            indexPage++;
            await page.goto(pageURL+indexPage.toString());
            console.log('\x1b[32m%s\x1b[0m','Открываю страницу: ',pageURL+indexPage.toString());
        } catch {
            console.log('\x1b[31m%s\x1b[0m','Не удалось открыть страницу: ',pageURL+indexPage.toString());
        }
    }while(nextPage)
    await browser.close();
}
Get(pageURL+indexPage.toString())