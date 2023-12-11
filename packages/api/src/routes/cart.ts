import { Plugin, Request, ResponseToolkit } from '@hapi/hapi';
import { menuItems } from '../db/menuItems.json';

const menuItemsDb = menuItems as MenuItem[];

type MenuItem = {
    id: string;
    name: string;
    price: number;
};

type Cart = {
    menuItems: MenuItem[];
    subtotal: number;
};

export const cart: Plugin<void> = {
    name: 'cart',
    register: async (server) => {
        server.route([
            {
                method: 'GET',
                path: '/cart',
                handler: getCartHandler
            },
            {
                method: 'POST',
                path: '/cart/{id}',
                handler: addCartHandler
            }
        ]);
    }
};

async function getCartHandler(request: Request, h: ResponseToolkit) {
    return h
        .response({ data: request.yar.get('cart') || { menuItems: [], subtotal: 0 } })
        .code(200);
}

async function addCartHandler(request: Request, h: ResponseToolkit) {
    const item = menuItemsDb.find(i => i.id === request.params.id);

    if (!item) {
        return h
            .response({ message: 'Error adding item to cart: Unrecognized menu item' })
            .code(422);
    }

    const cart: Cart = request.yar.get('cart') || { menuItems: [], subtotal: 0 };
    cart.menuItems.push(item);
    cart.subtotal = cart.menuItems.reduce((total, item) => total + item.price, 0);
    request.yar.set('cart', cart);

    return h
        .response({
            data: cart,
            message: 'Successfully added menu item to cart'
        })
        .code(201);
}
