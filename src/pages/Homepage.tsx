import PageNav from "./PageNav";
import LogoutButton from "../components/auth/LogoutButton";
import ProductList from "../components/products/ProductList";

const Homepage = () => {
  return (
    <div>
      <PageNav />
      <div>
        <ProductList />
      </div>
      <LogoutButton />
    </div>
  );
};

export default Homepage;
