import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { login } from "../../store/slices/authSlice";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { tokenRefreshService } from "../../services/tokenRefreshService";
import Navbar from "../elements/Navbar";

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((state: RootState) => state.auth);
  const { isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirect") || "/userpanel";

  // Efekt do przekierowania jeśli użytkownik jest już zalogowany
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Użytkownik już zalogowany, przekierowuję...");
      const targetPath = user.role === "admin" ? "/adminpanel" : redirectTo;
      navigate(targetPath);
    }
  }, [isAuthenticated, user, navigate, redirectTo]);

  // Cleanup timer przy odmontowaniu komponentu
  useEffect(() => {
    return () => {
      tokenRefreshService.clearRefreshTimer();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //console.log("Dispatching login for:", email);
    dispatch(login({ email, password })).then((result) => {
      if (login.fulfilled.match(result)) {
        const { expiresAt, user } = result.payload;

        // Po udanym logowaniu - ustaw timer odświeżania tokena
        if (expiresAt && user) {
          tokenRefreshService.setupTokenRefresh(expiresAt, () => {
            console.log("Token wymaga odświeżenia (callback z Login)");
            // Timer zadziała, ale rzeczywiste odświeżenie będzie
            // obsłużone przez hook useAuth w innych komponentach
          });

          console.log(
            `Token ważny do: ${new Date(expiresAt).toLocaleString()}`
          );
        }

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

  // Jeśli użytkownik jest już zalogowany, pokaż ładowanie zamiast formularza
  if (isAuthenticated) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Jesteś już zalogowany. Przekierowuję...</p>
        </div>
      </>
    );
  }
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
          <Link
            to={`/reset-password-request?redirect=${encodeURIComponent(
              redirectTo
            )}`}
            style={{ marginLeft: "10px" }}
          >
            Zapomniałeś hasła?
          </Link>
        </p>
      </form>
    </>
  );
};

export default Login;
