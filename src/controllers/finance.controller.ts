import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { FinanceInfo } from '@/services/finance/finance.service';

export class FinanceInfoController {
  public financeInfo = Container.get(FinanceInfo);

  public scrapInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const searhcQuery: string = req.body.searchQuery;

      // register a kafka consumer to consume data asynchronously
      this.financeInfo.registerKafkaHandlers();
      const returnedData = await this.financeInfo.getFinanceInfo(searhcQuery);

      if (!returnedData.dataProcessed) {
        res.status(201).json({ dataProcessed: false, message: returnedData.message });
        return;
      }

      res.status(201).json({ data: returnedData, message: 'DataScrapped' });
    } catch (error) {
      next(error);
    }
  };
}
