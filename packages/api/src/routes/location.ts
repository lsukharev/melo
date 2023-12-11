import { Plugin, Request, ResponseToolkit } from '@hapi/hapi';
import { locations } from '../db/locations.json';
// import { menuItems } from '../db/menuItems.json';

const locationsDb = locations as Location[];
// const menuItemsDb = menuItems as MenuItem[];

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

export const location: Plugin<void> = {
    name: 'location',
    register: async (server) => {
        server.route([
            {
                method: 'GET',
                path: '/locations',
                handler: getLocationsHandler
            },
            {
                method: 'GET',
                path: '/locations/{id}/menu',
                handler: getLocationMenuHandler
            }
        ]);
    }
};

async function getLocationsHandler(_: Request, h: ResponseToolkit) {
    return h
        .response({ data: locationsDb.map(l => ({ id: l.id, name: l.name })) })
        .code(200);
}

async function getLocationMenuHandler(request: Request, h: ResponseToolkit) {
    const location = locationsDb.find(l => l.id === request.params.id);

    if (!location) {
        return h
            .response({ message: 'Error getting location menu: Unrecognized location' })
            .code(422);
    }

    return h
        .response({ data: location })
        .code(200);
}
