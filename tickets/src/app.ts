import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import express from 'express';
import 'express-async-errors';

import { NotFoundError, currentUser, errorHandler } from '@bvidebecktickets/common';
import { createTicketRouter } from './routes/new';
import { showAllTicketsRouter } from './routes';
import { showTicketRouter } from './routes/show';
import { updateTicketRouter } from './routes/update';

const app = express();
app.set('trust proxy', true);

app.use(json());
app.use(cookieSession({ signed: false, secure: process.env.NODE_ENV !== 'test' }));

app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(showAllTicketsRouter);
app.use(updateTicketRouter);

app.all('*', async (req, res) => {
	throw new NotFoundError();
});

app.use(errorHandler);

export { app };
