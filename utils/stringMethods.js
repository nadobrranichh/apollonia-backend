import { calculateHST, calculateSubtotal } from "./cartMethods.js";
import { products } from "../server.js";

const markdownV2AvoidSymbols = [
  "_",
  // "*", using raw stars for actual markdown syntax
  "[",
  "]",
  "(",
  ")",
  "~",
  "`",
  ">",
  "#",
  "+",
  "-",
  "=",
  "|",
  "{",
  "}",
  ".",
  "!",
];

const formatCartData = function (cart) {
  const arr = cart.map((cartItem) => {
    const shopItem = products.find((item) => item.id === cartItem.id);
    return `x${cartItem.quantity} ${shopItem.title}`;
  });
  return arr.join("\n");
};

export const formatAddressString = function (address) {
  const {
    firstName,
    lastName,
    address1,
    address2,
    country,
    postalCode,
    city,
    state,
    phoneNumber,
  } = address;
  return `${firstName} ${lastName}, ${address1}${
    address2 ? `, ${address2}` : ""
  }, ${city}, ${state}, ${postalCode}, ${country}, Phone: ${phoneNumber}`;
};

export const formatOrderString = function (formData, cart) {
  const { shipping, billing, billingSameAsShipping, email } = formData;

  const subtotal = calculateSubtotal(cart);
  const hst = calculateHST(cart);
  let resultString = `
*New order!*

*Ordered Products:*
${formatCartData(cart)}

*Subtotal:* ${Number.parseFloat(subtotal / 100)} CAD
*HST:* ${Number.parseFloat(hst / 100)} CAD
*Total:* ${Number.parseFloat((subtotal + hst) / 100)} CAD

*Shipping Address:* 
${formatAddressString(shipping)}

*Billing Address:* 
${billingSameAsShipping ? "The same as shipping" : formatAddressString(billing)}

*Customer's email:* ${email}
`;

  markdownV2AvoidSymbols.forEach(
    (symbol) => (resultString = resultString.replaceAll(symbol, `\\${symbol}`))
  );
  return resultString;
};
