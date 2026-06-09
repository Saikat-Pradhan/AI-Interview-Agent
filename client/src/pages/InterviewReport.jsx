import {useState, useEffect} from 'react'
import { useParams } from "react-router-dom";
import axios from 'axios'
import Step3Report from '../components/Step3Report.jsx';
import {serverURL} from '../App.jsx'

const InterviewReport = () => {
  const {id} = useParams();
  const [report, setReport] = useState(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(serverURL + "/api/interview/report/" + id, {withCredentials:true})
        
        setReport(response.data)
      } catch (error) {
        console.log(error);
      }
    }

    fetchReport();
  }, [])

  if(!report) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-gray-500 text-lg'>
          Loading Report...
        </p>
      </div>
    )
  }

  return <Step3Report report={report}/>
}

export default InterviewReport
