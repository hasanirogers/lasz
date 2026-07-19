import { handler as ssrHandler } from './dist/server/entry.mjs';
import express from 'express';

const app = express();
const base = '/';
app.use(base, express.static('dist/client/'));
app.use(ssrHandler);

const port = process.env.PORT || 4323;
app.listen(port);
