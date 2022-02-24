module.exports = {
    baseURL: `https://app.ahrefs.com/user/login`,
    /**
     * {LAUNCH_TIMEOUT}: Timeout in which Puppeteer Launch its browser 
     * must be in milliseconds
     */
    launchTimeout: 180000,
    /**
     * {WAITING_TIMEOUT}: Timeout used in  WaitForSelector 
     * must be in milliseconds
     */
    waitingTimeout: 50000,
    /**
     * {NAVIGATION_TIMEOUT}: Timeout used for navigation between the pages and new URL's 
     * must be in milliseconds
     */
    navigationTimeOut: 180000,
}
