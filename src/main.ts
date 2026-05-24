import bootstrap from "./app.bootstrap";
import crypto from 'node:crypto'

bootstrap();

console.log(crypto.randomBytes(32).toString('hex'))