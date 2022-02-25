require("dotenv").config();
const config = require("./configuration/config");
const myHelper = require("./lib/puppeteerAPI");
const puppeteer = require("puppeteer");
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const commonFunction = require("./lib/commonFucntion");
const express = require("express");
const { default: axios } = require("axios");
const app = express();
const port = process.env.PORT || 3050;

let page,
  browser,
  domainRating,
  competingDomain,
  result = "Default Value";

async function getDR(keywordName) {
  try {
    browser = await puppeteer.launch({
      headless: config.headless,
      slowMo: 5,
      timeout: config.waitingTimeout * 2,
      defaultViewport: null,
      viewport: null,
      setViewportSize: null,
      args: config.browserArguments,
    });
    page = await commonFunction.launch_browser(browser, page);
    console.log(`Execution is Started...`);
    await commonFunction.login_to_ahref(
      page,
      process.env.HREF_USERNAME,
      process.env.HREF_PASSWORD
    );
    console.log(`User Logged in successfuly...${keywordName}`);
    await myHelper.typeText(page, keywordName, `[placeholder="Domain or URL"]`);
    await myHelper.click(page, `[class*="dropdownBorderRight"]~button div`);
    //await myHelper.click(page,`//h2//*[text()="Home - ${keywordName}"]`)
    domainRating = await myHelper.getText(
      page,
      `[id="DomainRatingContainer"]>span`
    );
    return domainRating;
  } catch (error) {
    throw new Error(`Error in GetDR | ${error}`);
  }
}
async function getCompetantDomain() {
  try {
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
    let bestCompetitor = await commonFunction.calculate_best_competitor(
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
    return competingDomain;
  } catch (error) {
    throw new Error(`Error in Get Competant Domain | ${error}`);
  }
}
async function getSelectedKeyword() {
  try {
    let allKeywordVolume = [];
    let allKeywordKD = [];
    await commonFunction.sorting_data(page, "Volume");
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
    let index = await commonFunction.calculate_best_keywords(
      page,
      allKeywordVolume,
      allKeywordKD
    );
    console.log(`Best Index ${index}`);
    selectedKeyword = await myHelper.getText(
      page,
      `(//tr[@id="row_id_${index}"]//td//a)[1]`
    );
    return selectedKeyword;
  } catch (error) {
    throw new Error(`Error while getting the best keyword ${error}`);
  }
}
async function getArticleList(keyword) {
  try {
    let response = (
      await commonFunction.get_open_api_response(keyword, openai)
    ).split("\n");
    return response;
  } catch (error) {
    throw new Error(
      `Error while getting the Article List from OpenAI ${error}`
    );
  }
}
async function getSurfSEOURL(keyword) {
  try {
    let bodyData = {
      keywords: ["${keyword}"],
      location: "United States",
      word_count: 2137,
    };
    const options = {
      headers: {
        "API-KEY": process.env.API_KEY_SURF,
        "Content-Type": "application/json",
      },
    };
    let response = await axios.post(
      `https://app.surferseo.com/api/v1/content_editors`,
      bodyData,
      options
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error while getting the Response from Surf SEO ${error}`);
  }
}

app.get("/full-flow", async (request, res) => {
  let result = {
    Your_URL: "keywordName",
    Domain_Rating: "domainRating",
    Competing_Domain: "competingDomain",
    Selected_Keyword: "selectedKeyword",
    Article_Titles: ["", "", ""],
  };
  try {
    let authentic = await commonFunction.is_authentic(
      request,
      process.env.MY_TOKEN
    );
    if (authentic) {
      res.type("text/plain");
      request.setTimeout(60000 * 10);
      result.Your_URL = request.query.url;
      result.Domain_Rating = await getDR(request.query.url);
      result.Competing_Domain = await getCompetantDomain();
      result.Selected_Keyword = await getSelectedKeyword();
      let response = await getArticleList(result.Selected_Keyword);
      result.Article_Titles[0] = response[2];
      result.Article_Titles[1] = response[3];
      result.Article_Titles[2] = response[4];
      console.log(`Response Sent: ${result.toString()}`);
      res.send(result);
    } else {
      console.log(`Execution End... For SurfSEO | Unauthorized`);
      res.status(401).json({ error: "Invalid credentials sent!" });
    }
  } catch (error) {
    res.status(403).send(`Error: ${error}`);
  } finally {
    await commonFunction.close_browser(browser, page);
    console.log(`Execution Completed.`);
  }
});
app.get("/generate-surferseo-post", async (request, res) => {
  let result = {
    Your_Keyword: "keywordName",
    Response_Received: "DefaultURL",
  };
  try {
    console.log(`Execution Started... For SurfSEO`);
    let authentic = await commonFunction.is_authentic(
      request,
      process.env.MY_TOKEN
    );
    if (authentic) {
      res.type("text/plain");
      request.setTimeout(60000 * 10);
      result.Your_Keyword = request.query.keyword;
      result.URL_Received = await getSurfSEOURL(request.query.keyword);
      res.send(result);
    } else {
      console.log(`Execution End... For SurfSEO | Unauthorized`);
      res.status(401).json({ error: "Invalid credentials sent!" });
    }
  } catch (error) {
    res.status(403).send(`Error: ${error}`);
  } finally {
    // await commonFunction.close_browser(browser,page);
    console.log(`Execution Completed.`);
  }
});
app.get("/generate-article-titles", async (request, res) => {
  let result = {
    Your_URL: "keywordName",
    Domain_Rating: "domainRating",
    Competing_Domain: "competingDomain",
    Selected_Keyword: "selectedKeyword",
    Article_Titles: ["", "", ""],
  };
  try {
    let authentic = await commonFunction.is_authentic(
      request,
      process.env.MY_TOKEN
    );
    if (authentic) {
      res.type("text/plain");
      request.setTimeout(60000 * 10);
      result.Your_URL = request.query.url;
      result.Domain_Rating = await getDR(request.query.url);
      result.Competing_Domain = await getCompetantDomain();
      result.Selected_Keyword = await getSelectedKeyword();
      let response = await getArticleList(result.Selected_Keyword);
      result.Article_Titles[0] = response[2];
      result.Article_Titles[1] = response[3];
      result.Article_Titles[2] = response[4];
      console.log(`Response Sent: ${result.toString()}`);
      res.send(result);
    } else {
      console.log(`Execution End... | Unauthorized`);
      res.status(401).json({ error: "Invalid credentials sent!" });
    }
  } catch (error) {
    res.status(403).send(`Error: ${error}`);
  } finally {
    await commonFunction.close_browser(browser, page);
    console.log(`Execution Completed.`);
  }
});
app.get("/get-best-keywords", async (request, res) => {
  let result = {
    Your_URL: "keywordName",
    Domain_Rating: "domainRating",
    Competing_Domain: "competingDomain",
    Selected_Keyword: "selectedKeyword",
  };
  try {
    let authentic = await commonFunction.is_authentic(
      request,
      process.env.MY_TOKEN
    );
    if (authentic) {
      res.type("text/plain");
      request.setTimeout(60000 * 10);
      result.Your_URL = request.query.url;
      result.Domain_Rating = await getDR(request.query.url);
      result.Competing_Domain = await getCompetantDomain();
      result.Selected_Keyword = await getSelectedKeyword();
      console.log(`Response Sent: ${result.toString()}`);
      res.send(result);
    } else {
      res.status(401).json({ error: "Invalid credentials sent!" });
    }
  } catch (error) {
    res.status(403).send(`Error: ${error}`);
  } finally {
    await commonFunction.close_browser(browser, page);
    console.log(`Execution Completed.`);
  }
});
app.get("/get-competing-domains", async (request, res) => {
  let result = {
    Your_URL: "keywordName",
    Domain_Rating: "domainRating",
    Competing_Domain: "competingDomain",
  };
  try {
    let authentic = await commonFunction.is_authentic(
      request,
      process.env.MY_TOKEN
    );
    if (authentic) {
      res.type("text/plain");
      request.setTimeout(60000 * 10);
      result.Your_URL = request.query.url;
      result.Domain_Rating = await getDR(request.query.url);
      result.Competing_Domain = await getCompetantDomain();
      console.log(`Response Sent: ${result.toString()}`);
      res.send(result);
    } else {
      res.status(401).json({ error: "Invalid credentials sent!" });
    }
  } catch (error) {
    res.status(403).send(`Error: ${error}`);
  } finally {
    await commonFunction.close_browser(browser, page);
    console.log(`Execution Completed.`);
  }
});
app.get("/get-DR", async (request, res) => {
  let result = {
    Your_URL: "keywordName",
    Domain_Rating: "domainRating",
  };
  try {
    let authentic = await commonFunction.is_authentic(
      request,
      process.env.MY_TOKEN
    );
    if (authentic) {
      res.type("text/plain");
      request.setTimeout(60000 * 10);
      result.Your_URL = request.query.url;
      result.Domain_Rating = await getDR(request.query.url);
      console.log(`Response Sent: ${result.toString()}`);
      res.send(result);
    } else {
      res.status(401).json({ error: "Invalid credentials sent!" });
    }
  } catch (error) {
    res.status(403).send(`Error: ${error}`);
  } finally {
    await commonFunction.close_browser(browser, page);
    console.log(`Execution Completed.`);
  }
});
app.use(express.json());
app.listen(port, () =>
  console.log(`Espresso ☕ is on Port ${port} Ctrl + C to Stop `)
);
