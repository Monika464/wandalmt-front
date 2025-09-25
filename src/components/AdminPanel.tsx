import React from "react";
import type { User } from "../types";

interface AdminLoginProps {
  onLogin: (loggedInUser: User) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  // component logic
  return <div>admin panel</div>;
};

export default AdminLogin;
