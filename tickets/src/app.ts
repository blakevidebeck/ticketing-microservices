import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import express from 'express';
import 'express-async-errors';

import { createTicketRouter } from './routes/new';

import { NotFoundError, currentUser, errorHandler } from '@bvidebecktickets/common';
import { showTicketRouter } from './routes/show';
import { showAllTicketsRouter } from './routes';

const app = express();
app.set('trust proxy', true);

app.use(json());
app.use(cookieSession({ signed: false, secure: process.env.NODE_ENV !== 'test' }));

app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(showAllTicketsRouter);

app.all('*', async (req, res) => {
	throw new NotFoundError();
});

app.use(errorHandler);

export { app };
