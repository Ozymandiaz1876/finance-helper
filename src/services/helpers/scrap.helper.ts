import { GoogleFinanceSelectors } from '@/constants';
import { Page } from 'puppeteer';

export const getTextContentFromPage = async (page: Page, selector: string) => {
  const selectorOnPage = await page.$(GoogleFinanceSelectors[selector]);
  if (!selectorOnPage) {
    return null;
  }

  return await selectorOnPage.evaluate(el => el.textContent.trim());
};
