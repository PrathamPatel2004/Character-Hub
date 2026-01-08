import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Contexts/AuthContext.jsx';
import CustomToaster from './Components/CustomToaster.jsx';
import Navbar from './Components/Navbar.jsx';
import Home from './Pages/Home.jsx';
import Login from './Pages/Login.jsx';
import Signup from './Pages/SignUp.jsx';
import OTPVerification from './Pages/OtpVerification'
import ForgotPassword from './Pages/ForgotPassword';
import ChangePassword from './Pages/ChangePassword';
import ResetPassword from './Pages/ResetPassword';
import AddProfileInfo from './Pages/AddProfileInfo'
import AddCharacter from './Pages/AddCharacter';
import EditCharacter from './Pages/EditCharacter';
import AddSeries from './Pages/AddSeries';
import EditSeries from './Pages/EditSeries';
import Categories from './Pages/Categories';
import Characters from './Pages/Characters'
import UserProfile from './Pages/UserProfile';
import Series from './Pages/Series';
import SeriesPage from './Pages/SeriesPage'
import CharacterPage from './Pages/CharacterPage'
import SearchResults from './Pages/SearchResult';

import './App.css';

function App() {
    const [loadingData, setLoadingData] = useState(true);
    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoadingData(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!loadingData) {
            const timeout = setTimeout(() => setShowLoader(false), 400);
            return () => clearTimeout(timeout);
        }
    }, [loadingData]);

    if (showLoader) {
        return (
            <div
                className={`min-h-screen flex justify-center items-center transition-opacity duration-500 ${
                    loadingData ? "opacity-100" : "opacity-0"
                }`}
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthProvider>
            <Router>
                <CustomToaster />
                <div className="min-h-screen bg-gradient-to-b from-[#C6FFDD] via-[#FBD786] to-[#f7797d]">
                    <Navbar />
                    <Routes>
                        <Route path='/' element={<Home />} />
                        <Route path='/login' element={<Login />} />
                        <Route path='/signup' element={<Signup />} />
                        <Route path='/otp-verification' element={<OTPVerification />} />
                        <Route path='/forgot-password' element={<ForgotPassword />} />
                        <Route path='/change-password' element={<ChangePassword />} />
                        <Route path='/reset-password/:token' element={<ResetPassword />} />
                        <Route path='/add-profile-info/:id' element={<AddProfileInfo />} />
                        <Route path='/add-character' element={<AddCharacter />} />
                        <Route path='/edit-character/:id' element={<EditCharacter />} />
                        <Route path='/add-series' element={<AddSeries />} />
                        <Route path='/edit-series' element={<EditSerie />) />
                        <Route path='/categories' element={<Categories />}/>
                        <Route path='/user/:id' element={<UserProfile />} />
                        <Route path='/series' element={<Series />} />
                        <Route path='/series/:id' element={<SeriesPage />} />
                        <Route path='/search-results' element={<SearchResults />} />
                        <Route path='/characters' element={<Characters />} />
                        <Route path='/character/:id' element={<CharacterPage />} />
                    </Routes>
                </div>
            </Router>   
        </AuthProvider>
    )
}

export default App
