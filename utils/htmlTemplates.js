import { formatAddressString } from "./stringMethods.js";
import { calculateHST, calculateSubtotal } from "./cartMethods.js";
import { products } from "../server.js";

const renderTableRow = function (title, quantity, price) {
  return `         
      <tr>
        <td style="text-align: start">
          ${title}
        </td>
        <td>${quantity}</td>
        <td>${quantity * price} CAD</td>
      </tr>`;
};

export const generateReceiptMarkup = function (formData, cart, sessionId) {
  const { shipping, billing, billingSameAsShipping } = formData;
  const subtotal = calculateSubtotal(cart);
  const hst = calculateHST(cart);

  return `    
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(75deg, #000, #624190); padding: 5rem 0; font-family: Arial; color: white;">
    <tr>
      <td align="center">
       <table width="600" cellpadding="0" cellspacing="0" style="color: white; text-align: center;">
          <tr>
            <td style="font-weight: 600; font-size: 25px;">
              Thank you for your order!
            </td>
          </tr>
          <tr>
              <td>
                <p
                  style="font-weight: 600; font-size: 20px;margin: 0 0 10px 0; text-align: start"
                >
                  Ordered Products:
                </p>
                <table style="margin-bottom: 10px">
                  <tr>
                    <th
                      style="text-align: start; width: 270px; word-wrap: break-word"
                    >
                      Name
                    </th>
                    <th style="text-align: center; width: 90px">Quantity</th>
                    <th style="text-align: center">Price</th>
                  </tr>
                  ${cart
                    .map((cartItem) => {
                      const shopItem = products.find(
                        (item) => item.id === cartItem.id
                      );
                      return renderTableRow(
                        shopItem.title,
                        cartItem.quantity,
                        shopItem.price_in_cents / 100
                      );
                    })
                    .join("")}
                </table>
                <p style="font-weight: 500; margin: 0 0 5px 0; text-align: start">
                  <b>Subtotal:</b> ${Math.ceil(subtotal / 100)} CAD
                </p>
                <p style="font-weight: 500; margin: 0 0 5px 0; text-align: start">
                  <b>HST:</b> ${Math.ceil(hst / 100)} CAD
                </p>
                <p style="font-weight: 500; margin: 0; text-align: start">
                  <b>Total:</b> ${Math.ceil((subtotal + hst) / 100)} CAD
                </p>
                <p
                  style="font-weight: 600; font-size: 20px; margin: 20px 0 0 0; text-align: start"
                >
                  Address Details:
                </p>
                <p
                  style="font-weight: 400; font-size: 1rem; margin: 10px 0 0 0; text-align: start"
                >
                  <b>Shipping Address:</b> ${formatAddressString(shipping)}
                </p>
                <p
                  style="font-weight: 400; font-size: 1rem; margin: 10px 0 0 0; text-align: start"
                >
                  <b>Billing Address:</b> ${
                    billingSameAsShipping
                      ? formatAddressString(shipping)
                      : formatAddressString(billing)
                  }
                </p>
                <p style="font-weight: 400, font-size: 1rem; text-align: start; padding-top: 20px">receipt id: ${sessionId}</p>
              </td>
            </tr>
        </table>
      </td>
    </tr>
  </table>
  `;
};
