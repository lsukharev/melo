import { server } from '../../src/server';
import { locations } from '../../src/db/locations.json';

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

describe('routes/location', () => {
    test('should successfully get all locations', async function () {
        const data = await server.inject('/locations');
        expect(data.statusCode).toBe(200);
        expect(data.result).toEqual({ data: locations.map(l => ({ id: l.id, name: l.name })) });
    });

    test('should successfully get menu of a valid location', async function () {
        const data = await server.inject('/locations/1/menu');
        expect(data.statusCode).toBe(200);
        expect(data.result).toEqual({ data: locations.find(l => l.id === '1') });
    });

    test('should fail getting menu of an invalid location', async function () {
        const data = await server.inject('/locations/999999999999999/menu');
        expect(data.statusCode).toBe(422);
        expect(data.result).toEqual({ message: 'Error getting location menu: Unrecognized location' });
    });
});
