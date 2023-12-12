import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

export default function Checkout() {
    const [cart, setCart] = useState<Cart | null>(null);
    const navigate = useNavigate();

    const fetchCart = async (locationID: string) => {
        const res = await fetch(`${SERVER_URL}/cart/${locationID}`, { credentials: 'include' });
        if (res.status === 204) {
            return navigate('/');
        }
        return res.json();
    };

    useEffect(() => {
        const locationID = sessionStorage.getItem('location');

        if (locationID) {
            fetchCart(locationID).then(setCart);
        } else {
            navigate('/');
        }
    }, []);

    return (
        <>
            <header>
                <h1>Checkout</h1>
            </header>
            <main className="card">
                {cart &&
                    <>
                        <h2>Review your order from {cart.location.name}</h2>
                        <ul className="cart-list">
                            {
                                cart.menuItems
                                    .map((i, index) => (
                                        <li className="cart-item" key={`${i.id}-${index}`}>
                                            {i.name} - ${(i.price / 100).toFixed(2)}
                                        </li>
                                    ))
                            }
                        </ul>
                        <div>Subtotal: {(cart.subtotal / 100).toFixed(2)}</div>
                    </>
                }
            </main>
        </>
    );
}
