import { Plugin, Request, ResponseToolkit } from '@hapi/hapi';
import { locations } from '../db/locations.json';
import { menuItems } from '../db/menuItems.json';

const locationsDb = locations as Location[];
const menuItemsDb = menuItems as MenuItem[];

type MenuItem = {
    id: string;
    name: string;
    price: number;
};

type Location = {
    id: string;
    name: string;
    menu: MenuItem[];
};

type Cart = {
    location: Location;
    menuItems: MenuItem[];
    subtotal: number;
};

type UpdateCartDTO = {
    menuItems: { id: string }[];
};

export const cart: Plugin<void> = {
    name: 'cart',
    register: async (server) => {
        server.route([
            {
                method: 'GET',
                path: '/cart/{locationID}',
                handler: getCartHandler
            },
            {
                method: 'POST',
                path: '/cart/{locationID}',
                handler: addCartHandler
            },
            {
                method: 'PUT',
                path: '/cart/{locationID}',
                handler: updateCartHandler
            }
        ]);
    }
};

async function getCartHandler(request: Request, h: ResponseToolkit) {
    const cart: Cart = request.yar.get(`cart-${request.params.locationID}`);

    if (!cart) {
        return h.response().code(204);
    }

    return h.response(cart).code(200);
}

async function addCartHandler(request: Request, h: ResponseToolkit) {
    const location = locationsDb.find(l => l.id === request.params.locationID);

    if (!location) {
        return h
            .response('Unrecognized location')
            .code(422);
    }

    const cart: Cart = { location, menuItems: [], subtotal: 0 };
    request.yar.set(`cart-${request.params.locationID}`, cart);

    return h.response(cart).code(201);
}

async function updateCartHandler(request: Request, h: ResponseToolkit) {
    const locationID = request.params.locationID;
    const location = locationsDb.find(l => l.id === locationID);

    if (!location) {
        return h
            .response('Unrecognized location')
            .code(422);
    }

    if (!request.yar.get(`cart-${locationID}`)) {
        return h
            .response('Specified cart does not exist')
            .code(422);
    }

    const resultCart: Cart = { location, menuItems: [], subtotal: 0 };
    const payload = request.payload as UpdateCartDTO;
    const validItems = payload.menuItems.every(i => {
        const menuItem = menuItemsDb.find(mi => mi.id === i.id);

        if (menuItem) {
            resultCart.menuItems.push(menuItem);
            resultCart.subtotal += menuItem.price;
            return true;
        }

        return false;
    });

    if (!validItems) {
        return h
            .response('Menu item not available at location')
            .code(422);
    }

    request.yar.set(`cart-${locationID}`, resultCart);

    return h.response(resultCart).code(201);
}
