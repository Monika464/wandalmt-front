function Footer() {
  return (
    <div className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4 text-center">
        <p>
          &copy; {new Date().getFullYear()} Wandalmt. Wszystkie prawa
          zastrzeżone.
        </p>
      </div>
    </div>
  );
}

export default Footer;
