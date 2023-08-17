import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Xingtu from "./xingtu/App";
import Xiaohongshu from "./xiaohongshu/App";
import Lab from './lab/App'
import Settings from './settings/App'


const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
    },
    {
        path: "/xingtu",
        element: <Xingtu/>,
    },
    {
        path: "/xiaohongshu",
        element: <Xiaohongshu/>,
    },
    {
        path: "/lab",
        element: <Lab/>,
    },
    {
        path: "/settings",
        element: <Settings/>,
    },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
