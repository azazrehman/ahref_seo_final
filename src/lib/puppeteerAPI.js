/**
 * This File contains wrapper functions for PlayWright and Puppeteer API
 */
const config = require('../configuration/config');
const waits = require('../constants/waits');
const delay = require('delay')
module.exports = {
	/**
	* Click on Any Element
	* 
	* @param  {DOM} page - page or a frame in which your selector exist which you want to click
	* @param  {string} selector - A selector which you want to click
	* @return {void} Nothing
	*/
	click: async function (page, selector) {
		try {
			if (selector.startsWith('/') || (selector.startsWith('('))) {//Handle XPath
				await module.exports.click_xPath(page, selector)
			}
			else {
				await page.waitForSelector(selector, { timeout: config.waitingTimeout })
				await page.focus(selector)
				await page.click(selector)
			}
		} catch (error) {

			throw new Error(`Could not click on selector: ${selector}  Detail Error:` + error)
		}
	},


	/**
	* Click on Any Element With Single Promise Navigation
	* 
	* @param  {DOM} page - page or a frame in which your selector exist which you want to click
	* @param  {string} selector - A selector which you want to click
	* @param  {string} button - the mouse button which you want to triger, default button is left 
	* @return {void} Nothing
	*/
	clickWithNavigate: async function (page, selector, button) {
		try {
			await Promise.all([
				module.exports.click(page, selector, button),
				page.waitForNavigation({ waitUntil: waits.networks.NETWORK_IDEAL_0/*,timeout:0*/ })
			])
		} catch (error) {
			//console.log('Error While Navigating: ' + error)
		}
	},
	/**
	* Type a text on Any input type Element
	* 
	* @param  {DOM} page - page or a frame in which your selector exist and you want to type text in that
	* @param  {string} text - sequences of characters which you want to type
	* @param  {string} selector - A selector in which you want to type
	* @param  {number} myDelay - delay in typing the text on given selector, default delay is 80 milisecond
	* @param  {boolean} eventDispatch - If typing is not work properly you can set this flag as true and then try
	*/
	typeText: async function (page, text, selector, myDelay, eventDispatch = false) {
		try {
			if (myDelay == undefined) {
				myDelay = 80
			}
			if (selector.startsWith('//') || (selector.startsWith('(//'))) {//Handle XPath
				await module.exports.typeTextXPath(page, text, selector)
			}
			else {
				await page.waitForSelector(selector, { timeout: config.waitingTimeout }),
					await Promise.all([
						page.focus(selector),
						page.click(selector, { clickCount: 3 }),
					]).catch(function (error) {
						throw new Error(`Could not type text into selector: ${selector} -> ${error}`)
					});
				await page.type(selector, text, { delay: myDelay })
			}

		} catch (error) {

			throw new Error(`Could not type text into selector: ${selector} -> ${error}`)
		} finally {
			await module.exports.takeScreenShot(page)
		}
	},

	/**
	* Get a text from DOM Element
	* 
	* @param  {DOM} page - page or a frame in which your selector exist and you want to type text in that
	* @param  {string} selector - A selector whose inside HTML text you want to retrieve
	* @return {string} inside text of an given HTML element
	*/
	getText: async function (page, selector, textOnly, maximumTime = 1000) {
		try {
			if (selector.startsWith('/') || (selector.startsWith('('))) {//Handle XPath
				await page.waitForXPath(selector, { timeout: maximumTime })
				let myElement = await page.$x(selector);
				return page.evaluate(el => el.textContent, myElement[0]);
			}
			else {
				await page.waitForSelector(selector, { timeout: config.waitingTimeout })
				if (textOnly) {

					return page.$eval(selector, e => e.innerText)
				}
				return page.$eval(selector, e => e.innerHTML)
			}

		} catch (error) {

			throw new Error(`Cannot get text from selector: ${selector} | ${error}`)
		}
	},

	/**
	* Click on Any XPATH Element
	* 
	* @param  {DOM} page - page or a frame in which your selector exist which you want to click
	* @param  {string} selector - A XPATH selector which you want to click
	*/
	click_xPath: async function (page, selector) {//TODO remove all click_xPath explicitly calls 
		try {
			await page.waitForXPath(selector, { timeout: config.waitingTimeout });
			const [button] = await page.$x(selector);
			await Promise.all([
				button.click(),
			]);

		} catch (error) {

			throw new Error(`Could not click on the XPath: ${selector} ` + error);
		} finally {
			await module.exports.takeScreenShot(page)
		}
	},


	/**
	* Wait for Element by XPATH
	* 
	* @param  {DOM} page - page or a frame where selector u want to wait
	* @param  {string} selector - A XPATH selector which u want wait for visible
	* @return {Void} Nothing
	*/
	waitForXPath: async function (page, selector, timeout = config.waitingTimeout) {
		try {
			await page.waitForXPath(selector, { timeout: timeout })
		} catch (error) {

			throw new Error(error)
		}
	},
	/**
   * Wait for Element by its Query Selector
   * 
   * @param  {DOM} page - page or a frame where selector u want to wait
   * @param  {string} selector - A Query selector which u want wait for visible
   * @return {Void} Nothing
   */
	waitForSelector: async function (page, selector, timeout = config.waitingTimeout) {
		try {
			await page.waitForSelector(selector, { timeout: timeout })
		} catch (error) {

			throw new Error(error)
		}
	},


	takeScreenShot: async function (page) {
		try {

		} catch (error) {

			console.log('Error While Taking ScreenShot: ' + error)
		}
	},
	/**
   * Get Number of count of given Element
   * 
   * @param  {DOM} page - page or a frame in which your selector exist which you want to click
   * @param  {string} selector - A selector which you want to count
   * @return {number} total given HTML element at given page or frame
   */
	getCount: async function (page, selector) {
		try {
			await page.waitForSelector(selector)
			return page.$$eval(selector, items => items.length)
		} catch (error) {
			throw new Error(`Cannot get count of selector: ${selector}`)
		}
	},
	/**
	 * Get Number of count of given Element
	 * 
	 * @param  {DOM} page - page or a frame in which your selector exist which you want to click
	 * @param  {string} selector - A selector which you want to count
	 * @return {number} total given HTML element at given page or frame
	 */
	getCount_xPath: async function (page, selector) {
		try {
			await page.waitForXPath(selector)
			return page.$x(selector, items => items.length)
		} catch (error) {
			throw new Error(`Cannot get count of XPath: ${selector}`)
		}
	},

}//end of wrapper functions for PlayWright and Puppeteer API