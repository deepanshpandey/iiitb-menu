const fs = require('fs');
const { chromium } = require('playwright');

const url_download = 'https://iiitbac-my.sharepoint.com/:x:/r/personal/deepansh_pandey_iiitb_ac_in/Documents/IIITB-Menu.xlsx';

const MAX_RETRIES = 5;
const TIMEOUT = 30000; // 30 seconds
const NAVIGATION_TIMEOUT = 45000; // 45 seconds

async function downloadFile(retryCount = 0) {
  let browser;
  try {
    browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      navigationTimeout: NAVIGATION_TIMEOUT,
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    console.log("Started attempt:", retryCount + 1);

    console.log("Starting Download");
    const downloadPromise = page.waitForEvent('download', {
      timeout: TIMEOUT
    });

    await page.goto(url_download, {
      waitUntil: 'networkidle',
      timeout: NAVIGATION_TIMEOUT
    });

    const download = await downloadPromise;
    const download_path = await download.path();

    if (!fs.existsSync('./data')) {
      fs.mkdirSync('./data', { recursive: true });
    }

    fs.copyFileSync(download_path, './data/IIITB-Menu.xlsx');
    console.log("XLSX file downloaded and copied successfully.");

    return true;
  } catch (error) {
    console.error(`Attempt ${retryCount + 1} failed:`, error.message);
    
    if (retryCount < MAX_RETRIES - 1) {
      console.log(`Retrying immediately... (${retryCount + 2}/${MAX_RETRIES})`);
      return downloadFile(retryCount + 1);
    } else {
      throw new Error(`Failed after ${MAX_RETRIES} attempts: ${error.message}`);
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

(async () => {
  try {
    await downloadFile();
  } catch (error) {
    console.error('Final error:', error.message);
    process.exit(1);
  }
})();
