import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-40 bg-surface-500 text-card-500 border-b border-neutral-700">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-primary-300 font-display text-2xl">RecoRead</Link>
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="text-card-500 hover:text-accent-500">Login</Link>
              <Link to="/register" className="px-4 py-2 rounded bg-primary-600 hover:bg-primary-700 text-white">
                Register
              </Link>
            </>
          ) : (
            <>
              <Link to="/library" className="hover:text-accent-500">Library</Link>
              <Link to="/profile" className="hover:text-accent-500">{user?.username || 'Profile'}</Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="px-3 py-2 rounded bg-error-500 text-white hover:opacity-90"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}