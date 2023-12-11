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
    menuItems: MenuItem[];
    subtotal: number;
};

export default function App() {
    const [location, setLocation] = useState('');
    const [locations, setLocations] = useState<Location[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<Cart>({ menuItems: [], subtotal: 0 });

    const handleAddToCart = async (item: MenuItem) => {
        const newCart = await fetchAddToCart(item.id);
        setCart(newCart);
    };

    const handleChangeLocation = async (locationID: string) => {
        setLocation(locationID);
        sessionStorage.setItem('location', locationID);

        const locationMenu = await fetchLocationMenu(locationID);
        setMenuItems(locationMenu.menu);
    };

    const fetchLocations = async (): Promise<Location[]> => {
        return fetch(`${SERVER_URL}/locations`)
            .then(res => res.json())
            .then(({ data }) => data);
    };

    const fetchLocationMenu = async (locationID: string): Promise<Location & { menu: MenuItem[] }> => {
        return fetch(`${SERVER_URL}/locations/${locationID}/menu`)
            .then(res => res.json())
            .then(({ data }) => data);
    };

    const fetchCart = async (): Promise<Cart> => {
        return fetch(`${SERVER_URL}/cart`, { credentials: 'include' })
            .then(res => res.json())
            .then(({ data }) => data);
    };

    const fetchAddToCart = async (itemID: string): Promise<Cart> => {
        return fetch(`${SERVER_URL}/cart/${itemID}`, { method: 'POST', credentials: 'include' })
            .then(res => res.json())
            .then(({ data }) => data);
    };

    useEffect(() => {
        fetchLocations().then(setLocations);

        const locationID = sessionStorage.getItem('location');

        if (locationID) {
            setLocation(locationID);
            fetchLocationMenu(locationID).then(data => setMenuItems(data.menu));
            fetchCart().then(setCart);
        }
    }, []);

    return (
        <>
            <header>
                <h1>Melo (Menu)</h1>
            </header>
            <main className="card">
                <div className="cart">
                    <Link to={'checkout'}>
                        Cart ({cart.menuItems.length} {cart.menuItems.length === 0 || cart.menuItems.length > 1 ? 'items' : 'item'})
                    </Link>
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
