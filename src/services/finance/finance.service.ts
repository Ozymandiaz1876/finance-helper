import { Inject, Service } from 'typedi';
import { ScraperService } from './scrap.service';
import { AiService } from './ai.service';
import { storeScrapedDataInDB, findRecentScrapedData } from '../helpers/finance.helper';
import { GoogleFinanceSelectors, GOOGLE_FINANCE_PAGE } from '@/constants';

@Service()
export class FinanceInfo {
  @Inject()
  private readonly scraperService!: ScraperService;

  private kafka: any;

  public async getFinanceInfo(searchQuery = 'ADANIGREEN:NSE') {
    // Try to find recent scraped data
    const scrapedData = await findRecentScrapedData(searchQuery);

    if (!scrapedData) {
      // If no recent data, produce a message to the Kafka topic
      const kafkaProducer = new KafkaProducer();
      await kafkaProducer.produceMessage('scraping-topic', { searchQuery });

      // Return a message indicating that the process is async
      return { dataProcessed: false, message: 'Processing started, please check back later.' };
    }

    return { dataProcessed: true, data: scrapedData };
  }

  public async handleAsyncFinanceTask() {
    // Register handler for the 'scraping-topic'
    const kafkaConsumer = new KafkaConsumer();
    kafkaConsumer.registerHandler('scraping-topic', async payload => {
      const { message } = payload;
      const { searchQuery } = JSON.parse(message.value.toString());

      // Perform scraping
      const scraperServiceInstance = this.scraperService.createInstance(GOOGLE_FINANCE_PAGE, searchQuery, GoogleFinanceSelectors);
      const scrapedData = await scraperServiceInstance.scrapData();

      // Save new scraped data
      if (Object.keys(scrapedData).length) {
        await storeScrapedDataInDB(searchQuery, scrapedData);
      }

      // add ai integration here
    });

    // Start consuming messages from the Kafka topic
    await kafkaConsumer.consumeMessages(['scraping-topic']);
  }
}
