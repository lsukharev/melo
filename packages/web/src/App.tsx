import { ChangeEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css'

const SERVER_URL = 'http://localhost:3000';

type MenuItem = {
    id: string;
    name: string;
    price: number;
};

type Location = {
    id: string;
    name: string;
};

type Cart = {
    location: Location;
    menuItems: MenuItem[];
    subtotal: number;
};

export default function App() {
    const [location, setLocation] = useState('');
    const [locations, setLocations] = useState<Location[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<Cart>({ location: { id: '', name: '' }, menuItems: [], subtotal: 0 });

    const handleAddToCart = async (item: MenuItem) => {
        const newCart = await fetchUpdateCart(location, [ ...cart.menuItems, item ]);
        setCart(newCart);
    };

    const handleChangeLocation = async (locationID: string) => {
        setLocation(locationID);
        sessionStorage.setItem('location', locationID);

        const locationMenu = await fetchLocation(locationID);
        setMenuItems(locationMenu.menu);

        fetchCart(locationID).then(setCart);
    };

    const fetchLocations = async (): Promise<Location[]> => {
        return fetch(`${SERVER_URL}/location`)
            .then(res => res.json());
    };

    const fetchLocation = async (locationID: string): Promise<Location & { menu: MenuItem[] }> => {
        return fetch(`${SERVER_URL}/location/${locationID}`)
            .then(res => res.json())
            .then(cart => cart ? cart : { location: { id: '', name: '' }, menuItems: [], subtotal: 0 });
    };

    const fetchCart = async (locationID: string): Promise<Cart> => {
        const res = await fetch(`${SERVER_URL}/cart/${locationID}`, { credentials: 'include' });
        if (res.status === 204) {
            return fetchCreateCart(locationID);
        }
        return res.json();
    };

    const fetchCreateCart = async (locationID: string): Promise<Cart> => {
        const options: RequestInit = {
            method: 'POST',
            credentials: 'include',
        };
        return fetch(`${SERVER_URL}/cart/${locationID}`, options)
            .then(res => res.json());
    };

    const fetchUpdateCart = async (locationID: string, menuItems: MenuItem[]): Promise<Cart> => {
        const options: RequestInit = {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
              },
            body: JSON.stringify({ menuItems: menuItems.map(i => ({ id: i.id })) }),
        };
        return fetch(`${SERVER_URL}/cart/${locationID}`, options)
            .then(res => res.json());
    };

    useEffect(() => {
        fetchLocations().then(setLocations);

        const locationID = sessionStorage.getItem('location');

        if (locationID) {
            setLocation(locationID);
            fetchLocation(locationID).then(data => setMenuItems(data.menu));
            fetchCart(locationID).then(setCart);
        }
    }, []);

    const cartLength = cart!.menuItems.length || 0;

    return (
        <>
            <header>
                <h1>Melo (Menu)</h1>
            </header>
            <main className="card">
                <div className="cart">
                    {
                        cart.menuItems.length > 0 &&
                            <Link to={'checkout'}>
                                Cart ({cartLength} {cartLength === 0 || cartLength > 1 ? 'items' : 'item'})
                            </Link>
                    }

                </div>
                <div className="location-dropdown">
                    <label htmlFor="location">Ordering from</label>
                    <select
                        name="location"
                        id="location"
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChangeLocation(e.target.value)}
                        value={location}
                    >
                        <option disabled value="">Select a location</option>
                        {
                            locations.map(l => (<option key={l.id} value={l.id}>{l.name}</option>))
                        }
                    </select>
                </div>
                {location && <ul className="menu-list">
                    {
                        menuItems
                            .map(i => (
                                <li className="menu-item" key={i.id}>
                                    <div>
                                        <div>{i.name}</div>
                                        <div>${(i.price / 100).toFixed(2)}</div>
                                        <button onClick={() => handleAddToCart(i)}>
                                            Add to Bag
                                        </button>
                                    </div>
                                </li>
                            ))
                    }
                </ul>}
            </main>
        </>
    );
}
