import { App } from '@/app';
import { AuthRoute } from '@routes/auth.route';
import { UserRoute } from '@routes/users.route';
import { ValidateEnv } from '@utils/validateEnv';
import { FinanceRoute } from './routes/finance.route';

ValidateEnv();

const app = new App();

app
  .initializeServer()
  .then(() => {
    const routes = [new AuthRoute(app.cacheClient), new UserRoute(app.cacheClient), new FinanceRoute(app.cacheClient)];
    app.addRoutes(routes);
    app.listen();
  })
  .catch(e => console.error(e));
