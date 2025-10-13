import type { ProductPublicItemProps } from "../../types";

import { formatCurrency } from "../../utils/formatcurremcy";

const ProductItem: React.FC<ProductPublicItemProps> = ({
  _id,
  title,
  description,
  price,
  imageUrl,
}) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-lg font-bold">{title}</h2>
      <img
        src={imageUrl}
        alt={title}
        className="h-40 object-cover rounded-md"
      />
      <p className="text-sm text-gray-600">{description}</p>
      <p className="font-bold">{formatCurrency(price)}</p>
    </div>
  );
};

export default ProductItem;
