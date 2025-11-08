import { Navigate } from 'react-router-dom'
import { useClinic } from '../context/clinicContext'
import Loader from './Loader'
import NotFound from '../pages/NotFound'


export default function ProtectedRoute({ children }) {
  const { clinic, loading } = useClinic()

  if (loading) {
    // show a loader while auth state initializes
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!clinic) {
    // clinic does not exist
    return <NotFound /> 
  }

  return children
}