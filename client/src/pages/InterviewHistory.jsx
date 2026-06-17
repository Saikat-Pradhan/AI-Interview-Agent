import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverURL } from '../App.jsx'
import { FaArrowLeft } from 'react-icons/fa'
import { MdDelete } from "react-icons/md";

const InterviewHistory = () => {
    const [interviews, setInterviews] = useState([])
    const [deleteMenuOpen, setDeleteMenuOpen] = useState(false);
    const navigate = useNavigate()

    useEffect(() => {
        const getMyInterviews = async () => {
            try {
                console.log(serverURL)
                const result = await axios.get(serverURL + "/api/interview/get-interview", { withCredentials: true });

                setInterviews(result.data)
            } catch (error) {
                return status(500).json({ message: `Failed to get interviews ${error}` })
            }
        }

        getMyInterviews()
    }, [])

    const deleteItem = async (id) => {
        try {
            setDeleteMenuOpen(false)
            await axios.post(serverURL + `/interview/delete/${id}`, { withCredentials: true })

            setTimeout(() => {
                navigate("/history");
            }, 3000);
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className='min-h-screen bg-linear-to-br from-gray-50 to-emerald-50 py-10'>
            <div className='w-[90vw] lg:w-[70vw] max-w-[90%] mx-auto'>
                <div className='mb-10 w-full flex items-start gap-4 flex-wrap'>
                    <button onClick={() => navigate("/")} className='mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition cursor-pointer'>
                        <FaArrowLeft className='text-gray-600' />
                    </button>

                    <div>
                        <h1 className='text-3xl font-bold flex-nowrap text-gray-800'>Interview History</h1>
                        <p className='text-gray-500 mt-2'>
                            Track your past interviews and performance reports
                        </p>
                    </div>
                </div>

                {interviews.length === 0 ?
                    <div className='bg-white p-10 rounded-2xl shadow text-center'>
                        <p className='text-gray-500'>
                            No interviews found. Start your first interview.
                        </p>
                    </div>
                    :
                    <div className='grid gap-3'>
                        {interviews.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => navigate(`/report/${item._id}`)}
                                className='bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100'
                            >
                                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                                    <div>
                                        <div className='flex gap-[1cm] items-center'>
                                            <h3 className='text-lg font-semibold text-gray-800'>
                                                {item.role}
                                            </h3>
                                            <div>
                                                <MdDelete className='text-red-600' onClick={(e) => {e.stopPropagation(); setDeleteMenuOpen(!deleteMenuOpen)}} />

                                                {/* Delete Confirmation */}
                                                {deleteMenuOpen && (
                                                    <ul className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-center shadow-lg rounded p-3'>
                                                        <p className='text-black font-serif text-[1.2rem]'>Are you sure?</p>
                                                        <div className='flex gap-2 mt-2'>
                                                            <div className='bg-red-600 rounded-[4px] w-[2cm] text-white' onClick={() => deleteItem(item._id)}>
                                                                <p className='p-1'>Delete</p>
                                                            </div>
                                                            <div className='bg-black rounded-[4px] w-[2cm] text-white' onClick={() => setDeleteMenuOpen(!deleteMenuOpen)}>
                                                                <p className='p-1'>Cancel</p>
                                                            </div>
                                                        </div>
                                                    </ul>
                                                )}
                                            </div>
                                        </div>

                                        <p className='text-gray-500 text-sm mt-1'>
                                            {item.experience} <span className='text-bold text-black'>--</span> {item.mode}
                                        </p>

                                        <p className='text-xs text-gray-400 mt-2'>
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className='flex items-center gap-6'>
                                        {/* Score */}
                                        <div className='text-right'>
                                            <p className='text-xl font-bold text-emerald-600'>
                                                {item.finalScore || 0}/10
                                            </p>
                                            <p className='text-xs text-nowrap  text-gray-400'>
                                                Overall Score
                                            </p>
                                        </div>

                                        {/* Status Badge */}
                                        <span
                                            className={`px-4 py-1 rounded-full text-xs font-medium 
                              ${item.status === "Completed"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                }
            </div>
        </div>
    )
}

export default InterviewHistory
