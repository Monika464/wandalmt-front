import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { login } from "../../store/slices/authSlice";
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "../elements/Navbar";

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirect") || "/userpanel";
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //console.log("Dispatching login for:", email);
    dispatch(login({ email, password })).then((result) => {
      if (login.fulfilled.match(result)) {
        if (result.payload.user.role === "admin") {
          navigate("/adminpanel");
        }
        if (result.payload.user.role === "user") {
          //navigate("/userpanel");
          navigate(redirectTo);
        }
      }
    });
  };

  return (
    <>
      <Navbar />

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">
          {status === "loading" ? "Logowanie..." : "Zaloguj"}
        </button>
        {error && <p>{error}</p>}
        <p>
          Nie masz konta?{" "}
          <Link to={`/register?redirect=${encodeURIComponent(redirectTo)}`}>
            Zarejestruj się
          </Link>
        </p>
      </form>
    </>
  );
};

export default Login;
