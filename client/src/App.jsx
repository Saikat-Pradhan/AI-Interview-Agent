import { react, useEffect } from 'react';
import {Route, Routes} from 'react-router-dom'
import { useDispatch } from 'react-redux';
import Home from './pages/Home'
import Auth from './pages/Auth'
import axios from 'axios';
import { setUserData } from './redux/userSlice';

export const serverURL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';

function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get(`${serverURL}/api/user/current-user`, { withCredentials: true });
        console.log("Current user:", response.data);
        dispatch(setUserData(response.data));
      } catch (error) {
        console.error("Error fetching current user:", error);
        dispatch(setUserData(null));
      }
    };

    getUser();
  }, [dispatch]);

  return (
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route path='/auth' element={<Auth/>} />
    </Routes>
  )
}

export default App
