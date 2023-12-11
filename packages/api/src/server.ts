import Hapi from '@hapi/hapi';
import yar from '@hapi/yar';
import 'dotenv/config';
import { cart } from './routes/cart';
import { location } from './routes/location';

process.on('unhandledRejection', (error) => {
    console.log(error);
    process.exit(1);
});

export const server = Hapi.server({
    host: 'localhost',
    port: 3000 ,
    routes: { cors: { credentials: true } }
});

async function init() {
    if (!process.env.SESSION_SECRET) {
        throw new Error('SESSION_SECRET variable is required for session storage');
    }

    await server.register([cart, location]);
    await server.register({
        plugin: yar,
        options: {
            maxCookieSize: 0,
            storeBlank: false,
            cookieOptions: {
                isSecure: false,
                password: process.env.SESSION_SECRET
            }
        }
    });
    await server.start();
    return server;
}

init().then(server => console.log(`Server running on ${server.info.uri}`));
