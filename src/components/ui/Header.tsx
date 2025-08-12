
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bookmark, RefreshCw, Menu, X, User, Home } from './Icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import Login from '../auth/Login';
import Signup from '../auth/Signup';

interface HeaderProps {
    savedCount: number;
}

const Header: React.FC<HeaderProps> = ({ savedCount }) => {
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      showNotification('success', 'Successfully logged out!');
      setIsMobileMenuOpen(false);
    } catch (error) {
      showNotification('error', 'Failed to logout. Please try again.');
    }
  };
  
  const linkStyle = "flex items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-3 rounded-xl text-stone-600 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-300 min-h-[44px] touch-manipulation active:scale-95 font-medium shadow-sm hover:shadow-md border border-transparent hover:border-orange-200";
  const activeLinkStyle = {
    background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)', // amber gradient
    color: '#78350F', // amber-900
    borderColor: '#F59E0B',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm safe-area-top">
        <nav className="container mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
          {/* Mobile Layout */}
          <div className="flex justify-between items-center lg:hidden">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold text-orange-600" onClick={closeMobileMenu}>
              <img src="/images/cookify_icon.jpg" alt="CookiFy" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg shadow-sm"/>
              <span className="block text-lg sm:text-xl">CookiFy</span>
            </NavLink>

            {/* Mobile Actions */}
            <div className="flex items-center gap-3">
              {/* Favorites with count - always visible on mobile */}
              <NavLink
                to="/favorites"
                className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-200 transition-all duration-200 shadow-sm active:scale-95"
                onClick={closeMobileMenu}
              >
                <Bookmark className="w-6 h-6" />
                {savedCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                    {savedCount > 99 ? '99+' : savedCount}
                  </span>
                )}
              </NavLink>

              {/* User Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-orange-100 text-orange-600 hover:bg-orange-200 transition-all duration-200 shadow-sm active:scale-95"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex justify-between items-center">
            <NavLink to="/" className="flex items-center gap-3 text-2xl xl:text-3xl font-bold text-orange-600">
              <img src="/images/cookify_icon.jpg" alt="CookiFy" className="w-12 h-12 xl:w-14 xl:h-14 rounded-lg shadow-sm"/>
              <span>CookiFy</span>
            </NavLink>
            <div className="flex items-center gap-3 xl:gap-6">
              <NavLink
                to="/"
                className={({ isActive }) => `${linkStyle} ${isActive ? 'font-bold' : ''} relative group`}
                style={({ isActive }) => isActive ? activeLinkStyle : {}}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-orange-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </span>
              </NavLink>
              <NavLink
                to="/reinvent"
                className={({ isActive }) => `${linkStyle} ${isActive ? 'font-bold' : ''} relative group`}
                style={({ isActive }) => isActive ? activeLinkStyle : {}}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  <span className="hidden xl:inline">Reinvent</span>
                  <span className="xl:hidden">Reinvent</span>
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">NEW</span>
                </span>
              </NavLink>
              <NavLink
                to="/favorites"
                className={({ isActive }) => `${linkStyle} ${isActive ? 'font-bold' : ''} relative group`}
                style={({ isActive }) => isActive ? activeLinkStyle : {}}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center gap-2">
                  <Bookmark className="w-5 h-5" />
                  <span className="hidden xl:inline">Favorites</span>
                  {savedCount > 0 && (
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                      {savedCount > 99 ? '99+' : savedCount}
                    </span>
                  )}
                </span>
              </NavLink>
              
              {/* Desktop Authentication */}
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden xl:flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-orange-700">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors min-h-[44px]"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors min-h-[44px]"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setShowSignup(true)}
                    className="px-4 py-2 text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 rounded-lg transition-colors min-h-[44px]"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 bg-white/95 backdrop-blur-sm rounded-b-2xl shadow-lg">
              <div className="flex flex-col space-y-3 pt-6 px-2">
                {/* Navigation Links */}
                <NavLink
                  to="/"
                  className={({ isActive }) => `${linkStyle} justify-start rounded-xl py-4 text-lg font-medium ${isActive ? 'bg-gradient-to-r from-amber-200 to-orange-200 text-amber-900 shadow-lg border border-orange-300' : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-orange-50'} active:scale-98 transition-all duration-300 relative group`}
                  onClick={closeMobileMenu}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-orange-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-3 w-full">
                    <Home className="w-6 h-6 ml-2" />
                    <span>Home</span>
                  </span>
                </NavLink>
                <NavLink
                  to="/reinvent"
                  className={({ isActive }) => `${linkStyle} justify-start rounded-xl py-4 text-lg font-medium ${isActive ? 'bg-gradient-to-r from-amber-200 to-orange-200 text-amber-900 shadow-lg border border-orange-300' : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'} active:scale-98 transition-all duration-300 relative group`}
                  onClick={closeMobileMenu}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-3 w-full">
                    <RefreshCw className="w-6 h-6 ml-2" />
                    <span>Reinvent</span>
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md ml-auto">NEW</span>
                  </span>
                </NavLink>

                {/* Authentication Section */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 px-4 py-4 bg-orange-50 rounded-xl shadow-sm">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-orange-800 text-lg">{user.name}</div>
                          <div className="text-sm text-orange-600">{user.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl transition-all duration-200 font-medium text-lg border border-orange-200 active:scale-98"
                      >
                        <User className="w-6 h-6" />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setShowLogin(true);
                          closeMobileMenu();
                        }}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl transition-all duration-200 font-semibold text-lg border-2 border-orange-200 active:scale-98"
                      >
                        <span>Login</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowSignup(true);
                          closeMobileMenu();
                        }}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 rounded-xl transition-all duration-200 font-semibold text-lg shadow-md active:scale-98"
                      >
                        <span>Sign Up</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
          onClick={closeMobileMenu}
        />
      )}

      {/* Authentication Modals */}
      {showLogin && (
        <Login
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
          onClose={() => setShowLogin(false)}
        />
      )}

      {showSignup && (
        <Signup
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
          onClose={() => setShowSignup(false)}
        />
      )}
    </>
  );
};

export default Header;
