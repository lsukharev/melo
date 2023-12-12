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
    server.stop().then(() => done());
});

describe('routes/location', () => {
    test('should successfully get all locations', async function () {
        const data = await server.inject('/location');
        expect(data.statusCode).toBe(200);
        expect(data.result).toEqual(locations.map(l => ({ id: l.id, name: l.name })));
    });

    test('should successfully get details of a valid location', async function () {
        const data = await server.inject('/location/1');
        expect(data.statusCode).toBe(200);
        expect(data.result).toEqual(locations.find(l => l.id === '1'));
    });

    test('should successfully get empty result for an invalid location', async function () {
        const data = await server.inject('/location/999999999999999');
        expect(data.statusCode).toBe(204);
        expect(data.result).toBeNull();
    });
});
