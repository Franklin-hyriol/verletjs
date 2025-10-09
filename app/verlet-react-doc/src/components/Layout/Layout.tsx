import React from 'react';
import { NavLink } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const activeLink = { color: 'white', fontWeight: 'bold' };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <nav className="bg-black bg-opacity-20 p-4 flex items-center gap-x-8 border-b border-gray-700">
        <h1 className="text-xl font-bold text-purple-400">Verlet-React</h1>
        <NavLink to="/" exact activeStyle={activeLink} className="text-gray-400 hover:text-white transition-colors">
          Home
        </NavLink>
        <NavLink to="/line-segments" activeStyle={activeLink} className="text-gray-400 hover:text-white transition-colors">
          Line Segments
        </NavLink>
      </nav>
      <main>
        {children}
      </main>
    </div>
  );
};
