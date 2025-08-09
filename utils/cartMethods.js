import { products } from "../server.js";

export const calculateHST = function (cart) {
  const subtotal = calculateSubtotal(cart);
  return subtotal * process.env.ONTARIO_HST;
};

export const calculateSubtotal = function (cart) {
  const subtotal = cart.reduce(
    (acc, el) =>
      (acc +=
        el.quantity *
        products.find((item) => item.id === el.id).price_in_cents),
    0
  );
  return subtotal;
};

export const checkCart = function (cart) {
  const newCart = [];
  cart.forEach((cartItem) => {
    const shopItem = products.find((shopItem) => shopItem.id === cartItem.id);
    if (!shopItem) return;

    let quantity = cartItem.quantity;
    if (quantity < 1) quantity = 1;
    if (quantity > shopItem.max_quantity) quantity = shopItem.max_quantity;
    newCart.push({ id: cartItem.id, quantity });
  });

  return newCart;
};
