import { Selectors } from '@/constants';
import puppeteer from 'puppeteer';
import { Service } from 'typedi';
import { getTextContentFromPage } from './helpers/scrap.helper';

@Service()
export class FinanceInfo {
  public async scrapData(searchQuery = 'ADANIGREEN:NSE') {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();

    // Navigate the page to a URL
    await page.goto(`https://www.google.com/finance/quote/${searchQuery}`);

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    const pageData = {};

    Object.keys(Selectors).forEach(selector => {
      pageData[selector] = getTextContentFromPage(page, selector);
    });

    await Promise.all(
      Object.keys(pageData).map(async key => {
        pageData[key] = await pageData[key];
      }),
    );

    console.log(`Company name is ${pageData.COMPANY_NAME} and current price is ${pageData.CURRENT_PRICE}`);

    await browser.close();
    return pageData;
  }
}
