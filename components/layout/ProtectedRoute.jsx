import { Navigate } from 'react-router-dom';
import useStore from '../../store/useStore';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useStore(state => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
}
