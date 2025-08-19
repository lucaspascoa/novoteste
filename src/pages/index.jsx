import Layout from "./Layout.jsx";

import Store from "./Store";

import AdminDashboard from "./AdminDashboard";

import ManageProducts from "./ManageProducts";

import StoreSettings from "./StoreSettings";

import ManageStaff from "./ManageStaff";

import ManageOrders from "./ManageOrders";

import TrackOrder from "./TrackOrder";

import AdminLogin from "./AdminLogin";

import DailyClosure from "./DailyClosure";

import ManageRoles from "./ManageRoles";

import ManageCategories from "./ManageCategories";

import ProductView from "./ProductView";

import Promotions from "./Promotions";

import Reports from "./Reports";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Store: Store,
    
    AdminDashboard: AdminDashboard,
    
    ManageProducts: ManageProducts,
    
    StoreSettings: StoreSettings,
    
    ManageStaff: ManageStaff,
    
    ManageOrders: ManageOrders,
    
    TrackOrder: TrackOrder,
    
    AdminLogin: AdminLogin,
    
    DailyClosure: DailyClosure,
    
    ManageRoles: ManageRoles,
    
    ManageCategories: ManageCategories,
    
    ProductView: ProductView,
    
    Promotions: Promotions,
    
    Reports: Reports,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Store />} />
                
                
                <Route path="/Store" element={<Store />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/ManageProducts" element={<ManageProducts />} />
                
                <Route path="/StoreSettings" element={<StoreSettings />} />
                
                <Route path="/ManageStaff" element={<ManageStaff />} />
                
                <Route path="/ManageOrders" element={<ManageOrders />} />
                
                <Route path="/TrackOrder" element={<TrackOrder />} />
                
                <Route path="/AdminLogin" element={<AdminLogin />} />
                
                <Route path="/DailyClosure" element={<DailyClosure />} />
                
                <Route path="/ManageRoles" element={<ManageRoles />} />
                
                <Route path="/ManageCategories" element={<ManageCategories />} />
                
                <Route path="/ProductView" element={<ProductView />} />
                
                <Route path="/Promotions" element={<Promotions />} />
                
                <Route path="/Reports" element={<Reports />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}