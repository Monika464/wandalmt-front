// src/components/elements/Footer.tsx
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Kolumna 1 - O nas */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {t("footer.companyName")}
            </h3>
            <p className="text-gray-300 text-sm">{t("footer.address")}</p>
            <p className="text-gray-300 text-sm mt-2">{t("footer.email")}</p>
            <p className="text-gray-300 text-sm">{t("footer.phone")}</p>
          </div>

          {/* Kolumna 2 - Linki */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t("footer.about")}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolumna 3 - Informacje prawne */}
          <div>
            <h3 className="text-lg font-bold mb-4">Informacje</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.privacy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolumna 4 - Social media (opcjonalnie) */}
          <div>
            <h3 className="text-lg font-bold mb-4">Social media</h3>
            <div className="flex space-x-4">
              {/* Tutaj możesz dodać ikony social mediów */}
            </div>
          </div>
        </div>

        {/* Copyright - dolna część stopki */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-300 text-sm">
          <p>
            &copy; {currentYear} Wandalmt. {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
