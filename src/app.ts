import 'reflect-metadata';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORTS, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@config';
import { Routes } from '@interfaces/routes.interface';
import { ErrorMiddleware } from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import { initializeRedisClient } from './middlewares/cache.middleware';

export class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public defaultPort = 3000;
  public routes: Routes[];

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.routes = routes;
  }

  public async initializeServer() {
    await initializeRedisClient();
    this.initializeMiddlewares();
    this.initializeRoutes(this.routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  public listen() {
    // const ports = PORTS.split(' ').map(el => +el);

    this.port = this.defaultPort;

    // TODO : updates this.port, fix this
    // await this.getOpenPort(ports);

    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    // for unhandled exceptions, catch them and let the app crash for server restart
    process
      .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
        process.exit(1);
      })
      .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
        process.exit(1);
      });

    this.app.use(ErrorMiddleware);
  }

  // TODO : not working in docker, fix me
  // private async getOpenPort(portsToSearch = [3000, 3005, 3006]) {
  //   return new Promise((resolve, reject) => {
  //     portscanner.findAPortNotInUse(portsToSearch, '127.0.0.1', (error, port) => {
  //       if (error) {
  //         console.log(error);
  //         reject(this.defaultPort);
  //       }
  //       console.log('AVAILABLE PORT AT: ' + port);
  //       this.port = port || this.defaultPort;
  //       resolve(port);
  //     });
  //   });
  // }
}
