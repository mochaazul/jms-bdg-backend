import express, { Express } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { ValidateError } from 'tsoa';
import { RegisterRoutes } from '../tsoa/routes';
import { ErrorHandler } from './errorHandler';
import Database from '@database';
import { E_ErrorType } from './errorHandler/enums';

const app: Express = express();

/************************************************************************************
 *                              Basic Express Middlewares
 ***********************************************************************************/
const db = new Database();
app.on('ready', async () => {
  await db.connectToDB()
})
app.set('json spaces', 2);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle logs in console during development
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  app.use(cors());
}

// Handle security and origin in production
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'production') {
  app.use(helmet());
}

/************************************************************************************
 *                               Register all routes
 ***********************************************************************************/

RegisterRoutes(app);

app.use("/docs", swaggerUi.serve, async (req: express.Request, res: express.Response) => {
  return res.send(swaggerUi.generateHTML(await import("../tsoa/swagger.json")));
});

/************************************************************************************
 *                               Express Error Handling
 ***********************************************************************************/

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof ValidateError) {
    console.error(`Caught Validation Error for ${req.path}:`, err.fields);
    return res.status(422).json({
      type: E_ErrorType.E_VALIDATION_ERROR,
      message: "Validation Failed",
      details: err?.fields,
    });
  }
  if(err instanceof ErrorHandler){
    return res.status(err.status || 500).json({
      type: err.type,
      message: err.message
    })
  }
  if (err instanceof Error) {
    return res.status(500).json({
      errorName: err.name,
      message: err.message,
      stack: err.stack || 'no stack defined'
    });
  }
  next();
});

app.emit('ready');
app.use(function notFoundHandler(_req, res: express.Response) {
  return res.status(404).send({ message: "Not Found" });
});

export default app;