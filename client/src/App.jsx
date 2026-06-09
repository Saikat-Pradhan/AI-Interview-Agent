import { react, useEffect } from 'react';
import {Route, Routes} from 'react-router-dom'
import { useDispatch } from 'react-redux';
import Home from './pages/Home'
import Auth from './pages/Auth'
import axios from 'axios';
import { setUserData } from './redux/userSlice';
import InterviewPage from './pages/InterviewPage'
import InterviewReport from './pages/InterviewReport'
import InterviewHistory from './pages/InterviewHistory';
import Pricing from './pages/Pricing';

export const serverURL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';

function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get(`${serverURL}/api/user/current-user`, { withCredentials: true });
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
      <Route path='/interview' element={<InterviewPage />} />
      <Route path='/report/:id' element={<InterviewReport />} />
      <Route path='/history' element={<InterviewHistory />} />
      <Route path='/pricing' element={<Pricing />} />
    </Routes>
  )
}

export default App
