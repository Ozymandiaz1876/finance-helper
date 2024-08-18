import express, { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { FinanceInfoController } from '@/controllers/finance.controller';
import { cacheMiddleware } from '@/middlewares/cache.middleware';

export class FinanceRoute implements Routes {
  public path = '/scrapinfo';
  public router: Router = express.Router();
  public financeInfoController = new FinanceInfoController();
  public cacheClient: cacheMiddleware;

  constructor(cacheClient) {
    this.cacheClient = cacheClient;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/:searchQuery([A-Z0-9]+:[A-Z]+)`,
      this.cacheClient.useCacheMiddleware({
        EX: 43200, // 12h
      }),
      this.financeInfoController.scrapInfo,
    );
  }
}
