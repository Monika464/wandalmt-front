import Navbar from "../components/elements/Navbar";
import ProductListPublicComponent from "../components/products/ProductPublicList";

const Homepage = () => {
  return (
    <div>
      <Navbar />
      <div>
        <ProductListPublicComponent />
      </div>
      {/* <div>
        <ProductList />
      </div>
      <LogoutButton /> */}
    </div>
  );
};

export default Homepage;
