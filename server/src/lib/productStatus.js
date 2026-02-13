export const calculateProductStatus = (product) => {
  const now = new Date();

  const isNewActive = product.newUntil && product.newUntil > now;

  const isPromoActive =
    product.promo &&
    product.promo.discountPercent > 0 &&
    product.promo.startDate &&
    product.promo.endDate &&
    product.promo.startDate <= now &&
    product.promo.endDate >= now;

  return { isNewActive, isPromoActive };
};

export const attachFinalPrice = (product, isPromoActive) => {
  if (!product.sizes) {
    return [];
  }

  const sizesWithFinalPrice = product.sizes.map((size) => {
    let finalPrice = size.price;

    if (isPromoActive && product.promo?.discountPercent) {
      finalPrice =
        size.price - (size.price * product.promo.discountPercent) / 100;
    }

    return {
      ...size.toObject(),
      finalPrice,
    };
  });

  return sizesWithFinalPrice;
};
