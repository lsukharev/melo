import { useEffect, useState } from 'react';

const SERVER_URL = 'http://localhost:3000';

type MenuItem = {
    id: string;
    name: string;
    price: number;
};

type CartMenuItem = MenuItem & { quantity: number };

type Cart = {
    menuItems: CartMenuItem[];
    subtotal: number;
};

export default function Checkout() {
    const [cart, setCart] = useState<Cart>({ menuItems: [], subtotal: 0 });

    const fetchCart = async (): Promise<Cart> => {
        return fetch(`${SERVER_URL}/cart`, { credentials: 'include' })
            .then(res => res.json())
            .then(({ data }) => data);
    };

    useEffect(() => {
        fetchCart().then(setCart);
    }, []);

    return (
        <>
            <header>
                <h1>Checkout</h1>
            </header>
            <main className="card">
                <ul className="cart-list">
                    {
                        cart.menuItems
                            .map(i => (
                                <li className="cart-item" key={i.id}>
                                    {i.name} - ${(i.price / 100).toFixed(2)} (x{i.quantity})
                                </li>
                            ))
                    }
                </ul>
                <div>Subtotal: {(cart.subtotal / 100).toFixed(2)}</div>
            </main>
        </>
    );
}
