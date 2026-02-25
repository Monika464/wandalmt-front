// components/user/UserProfile.tsx - wersja minimalistyczna
// components/user/UserProfile.tsx
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../../store/slices/userprofileSlice";
import type { AppDispatch, RootState } from "../../store";
import { useEffect, useState } from "react";
import { User, Mail, Shield, Edit } from "lucide-react";
import { ChangeEmail } from "../auth/ChangeEmail";

const UserProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isEditing, setIsEditing] = useState(false); // Stan do zarządzania trybem edycji

  const { profile, loading, error } = useSelector(
    (state: RootState) => state.userprofile,
  );

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  if (loading)
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Ładowanie profilu...</span>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">❌ Błąd: {error}</p>
      </div>
    );

  if (!profile)
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-600">Brak danych użytkownika</p>
      </div>
    );

  // Jeśli jesteśmy w trybie edycji, pokaż komponent ChangeEmail
  if (isEditing) {
    return (
      <ChangeEmail
        onClose={() => setIsEditing(false)}
        onSuccess={() => {
          setIsEditing(false);
          dispatch(fetchUserProfile()); // Odśwież dane po zmianie
        }}
      />
    );
  }

  // Normalny widok profilu
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Profil użytkownika</h2>

        {/* Przycisk edycji */}
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Edit size={18} />
          Edytuj profil
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Mail size={18} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="font-medium">{profile.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <User size={18} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Imię i nazwisko</p>
            <p className="font-medium">
              {profile.name} {profile.surname}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Shield size={18} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Rola</p>
            <p className="font-medium capitalize">{profile.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

// import { useDispatch, useSelector } from "react-redux";
// import { fetchUserProfile } from "../../store/slices/userprofileSlice";
// import type { AppDispatch, RootState } from "../../store";
// import { useEffect } from "react";

// const UserProfile: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();

//   const { profile, loading, error } = useSelector(
//     (state: RootState) => state.userprofile
//   );

//   useEffect(() => {
//     dispatch(fetchUserProfile());
//   }, [dispatch]);

//   if (loading) return <p>⏳ Ładowanie profilu...</p>;
//   if (error) return <p>❌ Błąd: {error}</p>;
//   if (!profile) return <p>Brak danych użytkownika</p>;

//   return (
//     <div>
//       <h2>Profil użytkownika</h2>
//       <p>Email: {profile.email}</p>
//       <p>Imię: {profile.name}</p>
//       <p>Nazwisko: {profile.surname}</p>
//       <p>Rola: {profile.role}</p>
//     </div>
//   );
// };

// export default UserProfile;
