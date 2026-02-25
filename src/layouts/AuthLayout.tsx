// layouts/AuthLayout.tsx
import { Outlet, Link } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        {/* Logo z linkiem do strony głównej */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-block hover:opacity-80 transition-opacity"
          >
            <img
              src="/assets/images/logomt.png"
              alt="Wandal Muaythai"
              className="h-16 w-auto mx-auto"
            />
          </Link>
        </div>

        {/* Kontener na formularz (login/register) */}
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
