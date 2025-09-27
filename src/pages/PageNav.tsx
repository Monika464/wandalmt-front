import { NavLink } from "react-router-dom";

const PageNav = () => {
  return (
    <div>
      <ul>
        <li>
          <NavLink to="/adminlogin">AdminLogin</NavLink>
        </li>
        <li>
          <NavLink to="/userlogin">UserLogin</NavLink>
        </li>
        <li>
          <NavLink to="/adminpanel">AdminPanel</NavLink>
        </li>
        <li>
          <NavLink to="/userpanel">UserPanel</NavLink>
        </li>
        <li>
          <NavLink to="/shop">Shop</NavLink>
        </li>
        <li>
          <NavLink to="/register">Register</NavLink>
        </li>
      </ul>
    </div>
  );
};

export default PageNav;
