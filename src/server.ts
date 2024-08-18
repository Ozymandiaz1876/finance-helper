import { App } from '@/app';
import { AuthRoute } from '@routes/auth.route';
import { UserRoute } from '@routes/users.route';
import { ValidateEnv } from '@utils/validateEnv';
import { FinanceRoute } from './routes/finance.route';

ValidateEnv();

const routes = [new AuthRoute(), new UserRoute(), new FinanceRoute()];

const app = new App(routes);

app
  .initializeServer()
  .then(() => {
    app.listen();
  })
  .catch(e => console.error(e));
