import React from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const ProductCart = ({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate } = useAppContext();

  if (!product) return null;

  const imageSrc = product.image?.[0] ?? "/fallback-image.png";
  const cartQty = cartItems?.[product._id] ?? 0;

  const handleNavigate = () => {
    navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
    scrollTo(0, 0);
  };

  return (
    <div
      onClick={handleNavigate}
      className="border border-gray-500/40 rounded-md md:px-4 px-3 py-2 bg-gray-100 min-w-46 max-w-46 w-full cursor-pointer"
    >
      {/* Product Image */}
      <div className="group flex items-center justify-center px-2">
        <img
          className="group-hover:scale-105 transition max-w-26 md:max-w-36 object-contain"
          src={imageSrc}
          alt={product.name ?? "Unnamed Product"}
        />
      </div>

      {/* Product Info */}
      <div className="text-gray-500/60 text-sm">
        <p>{product.category ?? "Unknown"}</p>
        <p className="text-gray-700 font-medium text-lg truncate w-full">{product.name}</p>

        {/* Stars */}
        <div className="flex items-center gap-0.5">
          {Array(5)
            .fill("")
            .map((_, i) => (
              <img
                key={i}
                src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                className="md:w-3.5 w-3"
                alt="star"
              />
            ))}
          <p>(4)</p>
        </div>

        {/* Price + Cart */}
        <div className="flex items-end justify-between mt-3">
          <p className="md:text-xl text-base font-medium text-primary">
            {currency}
            {product.offerPrice}{" "}
            <span className="text-gray-500/60 md:text-sm text-xs line-through">
              {currency}
              {product.price}
            </span>
          </p>

          <div className="text-primary" onClick={(e) => e.stopPropagation()}>
            {!cartQty ? (
              <button
                className="flex items-center justify-center cursor-pointer gap-1 bg-primary/10 border border-primary/40 md:w-[80px] w-[64px] h-[34px] rounded"
                onClick={() => addToCart(product._id)}
              >
                <img src={assets.cart_icon} alt="cart icon" />
                Add
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 md:w-20 w-16 h-[34px] bg-primary/25 rounded select-none">
                <button
                  onClick={() => removeFromCart(product._id)}
                  className="cursor-pointer text-md px-2 h-full"
                >
                  -
                </button>
                <span className="w-5 text-center">{cartQty}</span>
                <button
                  onClick={() => addToCart(product._id)}
                  className="cursor-pointer text-md px-2 h-full"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCart;
