import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../../store/slices/userprofileSlice";
import type { AppDispatch, RootState } from "../../store";
import { useEffect } from "react";

const UserProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { profile, loading, error } = useSelector(
    (state: RootState) => state.userprofile
  );

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  if (loading) return <p>⏳ Ładowanie profilu...</p>;
  if (error) return <p>❌ Błąd: {error}</p>;
  if (!profile) return <p>Brak danych użytkownika</p>;

  return (
    <div>
      <h2>Profil użytkownika</h2>
      <p>Email: {profile.email}</p>
      <p>Imię: {profile.name}</p>
      <p>Nazwisko: {profile.surname}</p>
      <p>Rola: {profile.role}</p>
    </div>
  );
};

export default UserProfile;
