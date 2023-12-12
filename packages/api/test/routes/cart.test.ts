import type { Request, ResponseToolkit } from '@hapi/hapi';
import { server } from '../../src/server';

const TEST_CART = {
    location: {
        id: '1',
        name: 'West 3rd',
        menu: [
            {
                id: '1',
                name: 'Hot Honey Chicken',
                price: 1545
            },
            {
                id: '2',
                name: 'Southwest Chicken Fajita',
                price: 1545
            },
            {
                id: '3',
                name: 'Miso Glazed Salmon',
                price: 1696
            }
        ]
    },
    menuItems: [
        {
            id: '1',
            name: 'Hot Honey Chicken',
            price: 1545,
        }
    ],
    subtotal: 1545
};

server.ext({
    type: 'onPreHandler',
    method: (request: Request, h: ResponseToolkit) => {
        request.yar.reset();
        request.yar.set(`cart-${TEST_CART.location.id}`, TEST_CART);
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
    server.stop().then(() => done());
});

describe('routes/cart', () => {
    test('should successfully get a cart stored in session', async function () {
        const res = await server.inject(`/cart/${TEST_CART.location.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.result).toEqual(TEST_CART);
    });

    test('should successfully get empty result for a nonexistent cart', async function () {
        const res = await server.inject('/cart/999999999999999');
        expect(res.statusCode).toBe(204);
        expect(res.result).toBeNull();
    });

    test('should successfully create a new cart', async function () {
        const res = await server.inject({ url: `/cart/${TEST_CART.location.id}`, method: 'POST' });
        expect(res.statusCode).toBe(201);
        expect(res.result).toEqual({ location: TEST_CART.location, menuItems: [], subtotal: 0 });
    });

    test('should fail to create a new cart at an invalid location', async function () {
        const res = await server.inject({ url: '/cart/999999999999999', method: 'POST' });
        expect(res.statusCode).toBe(422);
        expect(res.result).toBe('Unrecognized location');
    });

    test('should fail to update a cart at an invalid location ', async function () {
        const res = await server.inject({ url: '/cart/999999999999999', method: 'PUT' });
        expect(res.statusCode).toBe(422);
        expect(res.result).toEqual('Unrecognized location');
    });

    test('should fail to update a nonexistent cart', async function () {
        const res = await server.inject({ url: '/cart/2', method: 'PUT' });
        expect(res.statusCode).toBe(422);
        expect(res.result).toEqual('Specified cart does not exist');
    });

    test('should fail to update a cart with an invalid menu item', async function () {
        const options = {
            method: 'PUT',
            url: `/cart/${TEST_CART.location.id}`,
            payload: { menuItems: [{ id: 4 }] }
        };
        const res = await server.inject(options);
        expect(res.statusCode).toBe(422);
        expect(res.result).toEqual('Menu item not available at location');
    });

    test('should successfully update a cart', async function () {
        const expected = {
            location: {
                id: '1',
                name: 'West 3rd',
                menu: [
                    {
                        id: '1',
                        name: 'Hot Honey Chicken',
                        price: 1545
                    },
                    {
                        id: '2',
                        name: 'Southwest Chicken Fajita',
                        price: 1545
                    },
                    {
                        id: '3',
                        name: 'Miso Glazed Salmon',
                        price: 1696
                    }
                ]
            },
            menuItems: [
                {
                    id: '1',
                    name: 'Hot Honey Chicken',
                    price: 1545,
                },
                {
                    id: '3',
                    name: 'Miso Glazed Salmon',
                    price: 1696
                }
            ],
            subtotal: 3241
        }
        const options = {
            method: 'PUT',
            url: `/cart/${TEST_CART.location.id}`,
            payload: {
                menuItems: [
                    { id: '1' },
                    { id: '3' }
                ]
            }
        };
        const res = await server.inject(options);
        expect(res.statusCode).toBe(201);
        expect(res.result).toEqual(expected);
    });
});
