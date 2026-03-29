import type { ProductPublicItemProps } from "../../types/types";

import { useCurrency } from "../../hooks/useCurrency";

const ProductPublicItem: React.FC<ProductPublicItemProps> = ({
  title,
  description,
  price,
  imageUrl,
}) => {
  const { formatPrice } = useCurrency();
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-lg font-bold text-center mb-3">{title}</h2>
      <img
        src={imageUrl}
        alt={title}
        className="h-40 object-cover rounded-md mx-auto mb-4"
      />
      <p className="text-sm text-gray-600">{description}</p>
      <p className="text-lg font-bold text-blue-600 mb-6">
        {formatPrice(price)}
      </p>
    </div>
  );
};

export default ProductPublicItem;
