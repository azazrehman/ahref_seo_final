const puppeteer = require("puppeteer");
require("dotenv").config();
const config = require("./configuration/config");
const myHelper = require("./lib/puppeteerAPI");
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function run(keywordName, url) {
  let page,
    browser,
    domainRating,
    competingDomain,
    result = "Default Value";
  try {
    //Browser Launch
    browser = await puppeteer.launch({
      headless: true,
      slowMo: 5,
      timeout: 120000,
      defaultViewport: null,
      viewport: null,
      setViewportSize: null,
      args: [
        "--start-maximized",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--use-gl=egl",
        "--disable-extensions",
        "--disable-dev-shm-usage",
      ],
    });
    page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000);
    await page.setDefaultTimeout(60000);
    console.log(`Execution is Started...`);
    try {
      await login_to_ahref(
        page,
        process.env.HREF_USERNAME,
        process.env.HREF_PASSWORD,
        url
      );
      console.log(`User Logged in successfuly...${keywordName}`);

      await myHelper.typeText(
        page,
        keywordName,
        `[placeholder="Domain or URL"]`
      );
      await myHelper.clickWithNavigate(
        page,
        `[class*="dropdownBorderRight"]~button div`
      );
      //await myHelper.click(page,`//h2//*[text()="Home - ${keywordName}"]`)
      domainRating = await myHelper.getText(
        page,
        `[id="DomainRatingContainer"]>span`
      );
      await myHelper.clickWithNavigate(
        page,
        `[data-nav-type="pe_competing_domains"]`
      );
      let sites = await myHelper.getCount(page, `[class="contextMenu blue"]`);
      let allSiteTraffic = [];
      let allDomainRating = [];
      for (let index = 1; index < 11; index++) {
        await myHelper.click(
          page,
          `(//table[@id="main_se_data_table"]//a[@target="_blank"]/following-sibling::span)[${index}]`
        );
        let siteTraffic = await myHelper.getText(
          page,
          `[id="traffic"]>span[notranslate]`
        );
        if (siteTraffic.endsWith("K")) {
          siteTraffic.replace("K", "");
          siteTraffic = parseFloat(siteTraffic);
          siteTraffic = siteTraffic * 1000;
        } else if (siteTraffic.endsWith("M")) {
          siteTraffic.replace("M", "");
          siteTraffic = parseFloat(siteTraffic);
          siteTraffic = siteTraffic * 1000000;
        }
        let siteRating = await myHelper.getText(
          page,
          `[id="domain_rating"]>span[notranslate]`
        );
        allSiteTraffic.push(siteTraffic);
        allDomainRating.push(parseFloat(siteRating));
        await myHelper.click(page, `[id="se_pe_target"]`);
      }
      //console.log(allSiteTraffic);
      //console.log(allDomainRating);
      let bestCompetitor = await calculate_best_competitor(
        page,
        allSiteTraffic,
        allDomainRating
      );
      console.log(`Best Competitor is found at ${bestCompetitor}`);
      await page.screenshot({
        path: `Ahref_Best_Competitor_${Number(new Date())}.png`,
      });
      unique_compitetor_selector = `(//tbody[@id="container"]//tr[not(contains(@class,"limited"))]//td[4]/a)[${bestCompetitor}]`;
      competingDomain = await myHelper.getText(
        page,
        `(//table[@id="main_se_data_table"]//a[@target="_blank"])[${bestCompetitor}]`
      );
      try {
        await page.waitForXPath(unique_compitetor_selector);
        const [button] = await page.$x(unique_compitetor_selector);
        await Promise.all([button.click()]);
      } catch (error) {
        console.log(`Error ${error}`);
      }

      let allKeywordVolume = [];
      let allKeywordKD = [];
      await sorting_data(page, "Volume");
      let maxLimit = await myHelper.getCount(page, `[id^="row_id"]`);
      if (maxLimit > 16) {
        //Handle if there is less tahn 15 keywords
        maxLimit = 15;
      }
      for (let index = 1; index <= maxLimit; index++) {
        let keywordVolume = (
          await myHelper.getText(page, `(//tr[@id="row_id_${index}"]//td)[2]`)
        ).replace(/\D/g, "");
        let keywordKD = (
          await myHelper.getText(page, `(//tr[@id="row_id_${index}"]//td)[3]`)
        ).replace(/\D/g, "");
        allKeywordVolume.push(parseFloat(keywordVolume));
        allKeywordKD.push(parseFloat(keywordKD));
      }
      console.log(allKeywordVolume);
      console.log(allKeywordKD);
      await page.screenshot({
        path: `Ahref_Best_Keywords_${Number(new Date())}.png`,
      });
      let index = await calculate_best_keywords(
        page,
        allKeywordVolume,
        allKeywordKD
      );
      console.log(`Best Index ${index}`);
      selectedKeyword = await myHelper.getText(
        page,
        `(//tr[@id="row_id_${index}"]//td//a)[1]`
      );

      await browser.close();
    } catch (error) {
      result = result + error;
      console.log(error);
    } finally {
      result = {
        Your_URL: keywordName,
        Domain_Rating: domainRating,
        Competing_Domain: competingDomain,
        Selected_Keyword: selectedKeyword,
        Article_Titles: ["", "", ""],
      };
      console.log(`Execution is Completed.`);
      return result;
    }
  } catch (error) {
    console.log(error);
  }
}
async function login_to_ahref(page, username, password, url) {
  try {
    await page.goto(url, { waitUntil: `networkidle0` });
    await myHelper.typeText(page, username, `input[type="email"]`);
    await myHelper.typeText(page, password, `input[type="password"]`);
    await myHelper.clickWithNavigate(page, `[type="submit"]`);
    await page.screenshot({ path: `Ahref_Login_${Number(new Date())}.png` });
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: `Ahref_Login_Success_${Number(new Date())}.png`,
    });
  } catch (error) {
    throw new Error(`Error While Login to Ahref | ${error}`);
  }
}
async function calculate_best_competitor(
  page,
  allSiteTraffic,
  allDomainRating
) {
  let competitor = 0;
  try {
    //Make sure you don't chnage the origianl array index
    //Do some stuff to get the Best compitetor
    //(organicTraffic * 1) / (DR distance) * 1

    let calculated_values = [];
    for (let index = 0; index < allSiteTraffic.length; index++) {
      let value = (allSiteTraffic[index] * 1) / (allDomainRating[index] * 1);
      calculated_values.push(value);
    }

    //Using Custom Loop insatd of indexOf(Max) because of perfomance
    var max = calculated_values[0];
    competitor = 0;
    for (let index = 0; index < calculated_values.length; index++) {
      if (calculated_values[index] > max) {
        competitor = index;
        max = calculated_values[index];
      }
    }
  } catch (error) {
    console.log(`Error While Calculating Best competitor ${error}`);
  }
  return competitor + 1;
}
async function sorting_data(page, item_to_sort) {
  try {
    //Handling Sorting stuff Here
  } catch (error) {}
}
async function get_open_api_response(keyword) {
  let data = "My Default Data";
  try {
    data = await openai.createCompletion("text-davinci-001", {
      //prompt: `Please give me three titles for articles with the following theme: mail`,
      prompt: `Please give me three titles for articles with the following theme: ${keyword}`,
      temperature: 0.7,
      max_tokens: 64,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    console.log(data.data.choices[0].text);
    return data.data.choices[0].text;
  } catch (error) {
    console.log(`error: `, error);
  }
  return data;
}
async function calculate_best_keywords(page, allKeywordVolume, allKeywordKD) {
  let index = 0;
  try {
    //Make sure you don't chnage the origianl array index
    //Do some stuff to get the Best Keyword
    //(volume) * 1 / (keyword difficulty) * 1
    let calculated_values = [];
    for (let index = 0; index < allKeywordVolume.length; index++) {
      let value = (allKeywordVolume[index] * 1) / (allKeywordKD[index] * 1);
      calculated_values.push(value);
    }
    //Using Custom Loop insatd of indexOf(Max) because of perfomance
    var max = calculated_values[0];
    competitor = 0;
    for (let index = 0; index < calculated_values.length; index++) {
      if (calculated_values[index] > max) {
        competitor = index;
        max = calculated_values[index];
      }
    }
  } catch (error) {
    console.log(`Error While Calculating Best Keyword ${error}`);
  }
  return index + 1;
}
const express = require("express");
const app = express();
const port = process.env.PORT || 3050;
app.get("/find_keywords", async (request, res) => {
  let result = "Default Value";
  try {
    if (!request.headers.authorization) {
      return res.status(403).json({ error: "No credentials sent!" });
    } else {
      const token = request.headers.authorization.split(" ")[1];
      if (token == process.env.MY_TOKEN) {
        res.type("text/plain");
        request.setTimeout(60000 * 10);
        let url = config.baseURL;
        let keywordName = request.query.url;
        result = await run(keywordName, url);
        let response = (
          await get_open_api_response(result.Selected_Keyword)
        ).split("\n");
        result.Article_Titles[0] = response[2];
        result.Article_Titles[1] = response[3];
        result.Article_Titles[2] = response[4];
        console.log(`Response Sent: ${result.toString()}`);
        res.send(result);
      } else {
        res.status(401).json({ error: "Invalid credentials sent!" });
      }
    }
  } catch (error) {
    res.sendStatus(403);
    res.send(`Error ${error} | Response ${result}`);
  }
});

app.use(express.json());
app.listen(port, () =>
  console.log(`Expresso ☕ is on Port ${port} Ctrl + C to Stop `)
);
