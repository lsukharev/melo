import type { Request, ResponseToolkit } from '@hapi/hapi';
import { server } from '../../src/server';

const TEST_CART = {
    menuItems: [
        {
            id: '1',
            name: 'Hot Honey Chicken',
            price: 1545,
            quantity: 1
        }
    ],
    subtotal: 1545
};

server.ext({
    type: 'onPreHandler',
    method: (request: Request, h: ResponseToolkit) => {
        request.yar.reset();
        request.yar.set('cart', TEST_CART);
        return h.continue;
    }
});

beforeAll((done) => {
    server.events.on('start', () => {
        done();
    });
});

afterAll((done) => {
    server.events.on('stop', () => {
        done();
    });
    server.stop();
});

describe('routes/cart', () => {
    test('should successfully get a cart stored in session', async function () {
        const res = await server.inject('/cart');
        expect(res.statusCode).toBe(200);
        expect(res.result).toEqual({ data: TEST_CART });
    });

    test('should successfully add a new menu item to the cart', async function () {
        const expected = {
            menuItems: [
                {
                    id: '1',
                    name: 'Hot Honey Chicken',
                    price: 1545,
                    quantity: 1
                },
                {
                    id: '2',
                    name: 'Southwest Chicken Fajita',
                    price: 1545,
                    quantity: 1
                }
            ],
            subtotal: 3090
        }
        const res = await server.inject({ url: '/cart/2', method: 'POST' });
        expect(res.statusCode).toBe(201);
        expect(res.result).toEqual({
            data: expected,
            message: 'Successfully added menu item to cart'
        });
    });

    test('should successfully update the quantity of a menu item in the cart', async function () {
        // TODO (Leo): This expected result is based on the previous test's result
        // which is incorrect. Each test should start with it's own test data.
        // Need to investigate why yar (session manager) is reading the previous
        // session data after a call to `reset` and / or `clear`.
        const expected = {
            menuItems: [
                {
                    id: '1',
                    name: 'Hot Honey Chicken',
                    price: 1545,
                    quantity: 2
                },
                {
                    id: '2',
                    name: 'Southwest Chicken Fajita',
                    price: 1545,
                    quantity: 1
                }
            ],
            subtotal: 4635
        }
        const res = await server.inject({ url: '/cart/1', method: 'POST' });
        expect(res.statusCode).toBe(201);
        expect(res.result).toEqual({
            data: expected,
            message: 'Successfully added menu item to cart'
        });
    });

    test('should fail to add an invalid menu item to the cart', async function () {
        const res = await server.inject({ url: '/cart/999999999999999', method: 'POST' });
        expect(res.statusCode).toBe(422);
        expect(res.result).toEqual({ message: 'Error adding item to cart: Unrecognized menu item' });
    });
});
