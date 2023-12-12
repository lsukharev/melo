import { Plugin, Request, ResponseToolkit } from '@hapi/hapi';
import { locations } from '../db/locations.json';

const locationsDb = locations as Location[];

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
                path: '/location',
                handler: getLocationsHandler
            },
            {
                method: 'GET',
                path: '/location/{id}',
                handler: getLocationHandler
            }
        ]);
    }
};

async function getLocationsHandler(_: Request, h: ResponseToolkit) {
    return h
        .response(locationsDb.map(l => ({ id: l.id, name: l.name })))
        .code(200);
}

async function getLocationHandler(request: Request, h: ResponseToolkit) {
    const location = locationsDb.find(l => l.id === request.params.id);

    if (!location) {
        return h.response().code(204);
    }

    return h.response(location).code(200);
}
