import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Checkout from './Checkout';
import './index.css'

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />
    },
    {
        path: '/checkout',
        element: <Checkout />
    }
]);

ReactDOM
    .createRoot(document.getElementById('root')!)
    .render(
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    )
