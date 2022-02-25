/**
 * Sample File that contains all the commons functions
 */
const config = require("./../configuration/config");
const myHelper = require("./puppeteerAPI");
module.exports = {
  /**
   * login_to_ahref | Sample fucntion that login to a Ahref
   * @param {*} page
   * @param {*} username
   * @param {*} password
   */
  login_to_ahref: async function (page, username, password) {
    try {
      await page.goto(config.baseURL, { waitUntil: `networkidle0` });
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
  },

  launch_browser: async function (browser, page) {
    try {
      page = await browser.newPage();
      await page.setDefaultNavigationTimeout(config.waitingTimeout);
      await page.setDefaultTimeout(config.waitingTimeout);
      return page;
    } catch (error) {
      throw new Error(`Error While Launch Browser | ${error}`);
    }
  },

  is_authentic: async function (request, token) {
    try {
      if (!request.headers.authorization) {
        return false;
      } else {
        const token_received = request.headers.authorization.split(" ")[1];
        if (token_received == token) {
          return true;
        }
        return false;
      }
    } catch (error) {
      throw new Error(`Error While Authetic the User | ${error}`);
    }
  },
  calculate_best_competitor: async function (
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
  },
  get_open_api_response: async function (keyword, openai) {
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
  },
  calculate_best_keywords: async function (
    page,
    allKeywordVolume,
    allKeywordKD
  ) {
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
  },
  sorting_data: async function (page, item_to_sort) {
    try {
      //Handling Sorting stuff Here
    } catch (error) {}
  },
  close_browser: async function (browser, page) {
    try {
      await browser.close();
    } catch (error) {
      //throw new Error(`Error While close_browser | ${error}`);
    }
  },
};
