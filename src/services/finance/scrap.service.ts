import { Service } from 'typedi';
import puppeteer from 'puppeteer';
import { getTextContentFromPage } from '../helpers/scrap.helper';
import { GoogleFinanceSelectors, GOOGLE_FINANCE_PAGE } from '@/constants';

@Service()
export class ScraperService {
  private page: string;
  private searchQuery: string;
  private puppeteerLauchArgs: string[];
  private scrapSelectors;

  /**
   * Initializes a new instance of the ScraperService class.
   * @param {string} page - The base URL for the page, by default Google Finance page is used.
   * @param {string} searchQuery - The search query to use if page needs to be extedned.'
   * @param {Selectors} Selectors - The selectors to use for scraping.
   * @param {string} [puppeteerArgs] - The arguments to pass to Puppeteer.
   * @return {void}
   */

  createInstance(page = GOOGLE_FINANCE_PAGE, searchQuery = 'ADANIGREEN:NSE', Selectors = GoogleFinanceSelectors, puppeteerArgs = ['--no-sandbox']) {
    const instance = new ScraperService();
    instance.scrapSelectors = Selectors;
    instance.puppeteerLauchArgs = puppeteerArgs;
    instance.page = page;
    instance.searchQuery = searchQuery;
    return instance;
  }

  /**
   * Scrapes data from a webpage using Puppeteer.
   *
   * This function launches a new browser instance, navigates to the specified page,
   * sets the screen size, and extracts data from the page using the provided selectors.
   *
   * @return {object} An object containing the scraped data, where each key is a selector
   *                  and the value is the corresponding text content
   */
  public async scrapData() {
    const browser = await puppeteer.launch({
      args: this.puppeteerLauchArgs,
    });
    const page = await browser.newPage();

    // Navigate the page to a URL
    await page.goto(`${this.page}${this.searchQuery}`);

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    const pageData: { [key: string]: string | Promise<string> } = {};

    Object.keys(this.scrapSelectors).forEach(selector => {
      pageData[selector] = getTextContentFromPage(page, selector);
    });

    await Promise.all(
      Object.keys(pageData).map(async key => {
        pageData[key] = await pageData[key];
      }),
    );
    await browser.close();
    return pageData;
  }
}
