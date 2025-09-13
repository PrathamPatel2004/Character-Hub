import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './Components/Navbar'
import Home from './Pages/Home'
import Signup from './Pages/SignUp';
import Login from './Pages/Login';
import OTPVerification from './Pages/OtpVerification'
import ForgotPassword from './Pages/ForgotPassword';
import ChangePassword from './Pages/ChangePassword';
import AddProfileInfo from './Pages/AddProfileInfo'
import AddCharacter from './Pages/AddCharacter';
import AddSeries from './Pages/AddSeries';
import Categories from './Pages/Categories';
import Characters from './Pages/Characters'
import UserProfile from './Pages/UserProfile';
import Series from './Pages/Series';
import SeriesPage from './Pages/SeriesPage'
import CharacterPage from './Pages/CharacterPage'
import SearchResults from './Pages/SearchResult';
import './App.css'

function App() {
    return(
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gradient-to-b from-[#C6FFDD] via-[#FBD786] to-[#f7797d]">
                    <Navbar />
                    <Routes>
                        <Route path='/' element={<Home />} />
                        <Route path='/login' element={<Login />} />
                        <Route path='/otp-verification' element={<OTPVerification />} />
                        <Route path='/forgot-password' element={<ForgotPassword />} />
                        <Route path='/change-password' element={<ChangePassword />} />
                        <Route path='/signup' element={<Signup />} />
                        <Route path='/add-character' element={<AddCharacter />} />
                        <Route path='/add-series' element={<AddSeries />} />
                        <Route path='/add-profile-info/:id' element={<AddProfileInfo />} />
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
            <Toaster />
        </AuthProvider>
    )
}

export default App