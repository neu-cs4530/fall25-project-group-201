import { useState } from 'react';
import './index.css';
import { NavLink, useLocation } from 'react-router-dom';
import useUserContext from '../../../hooks/useUserContext';
import {
  MessageCircleQuestionMark,
  Hash,
  MessageCircle,
  Users,
  Gamepad2,
  Users as CommunitiesIcon,
  Bookmark,
  ChevronDown,
} from 'lucide-react';

/**
 * The SideBarNav component has a sidebar navigation menu for all the main pages.
 * It highlights the currently selected item based on the active page and
 * triggers corresponding functions when the menu items are clicked.
 */
const SideBarNav = () => {
  const { user } = useUserContext();
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const location = useLocation();

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const isActiveOption = (path: string) =>
    location.pathname === path ? 'message-option-selected ' : '';

  return (
    <div id="sideBarNav" className="sideBarNav">
      <NavLink
        to="/home"
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
      >
        <MessageCircleQuestionMark size={16} className="menu-icon" />
        Questions
      </NavLink>

      <NavLink
        to="/tags"
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
      >
        <Hash size={16} className="menu-icon" />
        Tags
      </NavLink>

      <div className={`menu_button ${location.pathname.startsWith('/messaging') ? 'menu_selected' : ''}`} onClick={toggleOptions}>
        <MessageCircle size={16} className="menu-icon" />
        Messaging
        <ChevronDown
          size={16}
          className={`dropdown-arrow ${showOptions ? 'open' : ''}`}
        />
      </div>

      {showOptions && (
        <div className="additional-options">
          <NavLink
            to="/messaging"
            className={`menu_button message-options ${isActiveOption('/messaging')}`}
          >
            Global Messages
          </NavLink>
          <NavLink
            to="/messaging/direct-message"
            className={`menu_button message-options ${isActiveOption('/messaging/direct-message')}`}
          >
            Direct Messages
          </NavLink>
        </div>
      )}

      <NavLink
        to="/users"
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
      >
        <Users size={16} className="menu-icon" />
        Users
      </NavLink>

      <NavLink
        to="/games"
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
      >
        <Gamepad2 size={16} className="menu-icon" />
        Games
      </NavLink>

      <NavLink
        to="/communities"
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
      >
        <CommunitiesIcon size={16} className="menu-icon" />
        Communities
      </NavLink>

      <NavLink
        to={`/collections/${user.username}`}
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
      >
        <Bookmark size={16} className="menu-icon" />
        My Collections
      </NavLink>
    </div>
  );
};

export default SideBarNav;
