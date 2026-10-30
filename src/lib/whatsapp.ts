/**
 * Utility for formatting WhatsApp order links and messages
 */

export function cleanPhoneNumber(phone: string): string {
  // Strip everything except numbers
  return phone.replace(/[^0-9]/g, "");
}

export function createWhatsAppUrl(phone: string, text: string): string {
  const clean = cleanPhoneNumber(phone);
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${clean}?text=${encoded}`;
}

export function buildProductWhatsAppText(
  product: {
    name: string;
    price: number;
    slug: string;
    brand?: string;
    fits?: string[];
    image?: string;
  },
  qty: number = 1,
  option?: string,
  origin: string = ""
): string {
  const total = (product.price * qty).toFixed(0);

  // Build full public URL for product image so WhatsApp can show preview/link
  let fullImageUrl = product.image || "";
  if (fullImageUrl && !fullImageUrl.startsWith("http://") && !fullImageUrl.startsWith("https://")) {
    const cleanOrigin = origin || (typeof window !== "undefined" ? window.location.origin : "");
    fullImageUrl = cleanOrigin ? `${cleanOrigin}${fullImageUrl.startsWith("/") ? "" : "/"}${fullImageUrl}` : fullImageUrl;
  }

  let text = `👋 Hello YSK 4X4! I would like to order this item:\n\n`;
  text += `📦 *Product:* ${product.name}\n`;
  if (product.brand) text += `🏷️ *Brand:* ${product.brand}\n`;
  text += `🔢 *Quantity:* ${qty}\n`;
  if (option) text += `⚙️ *Option / Spec:* ${option}\n`;
  text += `💰 *Price:* $${product.price} each (Total: $${total})\n`;
  if (product.fits && product.fits.length > 0) {
    text += `🚙 *Vehicle Fitment:* ${product.fits.join(", ")}\n`;
  }
  text += `🆔 *Product ID:* ${product.slug}\n`;
  if (fullImageUrl) {
    text += `🖼️ *Product Image:* ${fullImageUrl}\n`;
  }
  text += `\nPlease confirm availability and share payment/delivery options. Thank you!`;
  return text;
}

export function buildCartWhatsAppText(
  order: {
    orderId?: string;
    items: Array<{ name: string; qty: number; price: number; option?: string; image?: string }>;
    total: number;
    customer?: { name?: string; phone?: string; address?: string; city?: string };
  },
  origin: string = ""
): string {
  const cleanOrigin = origin || (typeof window !== "undefined" ? window.location.origin : "");
  let text = `👋 Hello YSK 4X4! I would like to place an order for the following items:\n\n`;
  if (order.orderId) text += `🧾 *Order ID:* ${order.orderId}\n\n`;
  text += `🛒 *Ordered Items:*\n`;
  order.items.forEach((item, idx) => {
    const itemTotal = (item.price * item.qty).toFixed(0);
    text += `${idx + 1}. *${item.name}* x${item.qty} — $${itemTotal}${item.option ? ` (${item.option})` : ""}\n`;
    if (item.image) {
      let fullImg = item.image;
      if (!fullImg.startsWith("http://") && !fullImg.startsWith("https://")) {
        fullImg = cleanOrigin ? `${cleanOrigin}${fullImg.startsWith("/") ? "" : "/"}${fullImg}` : fullImg;
      }
      text += `   🖼️ Image: ${fullImg}\n`;
    }
  });
  text += `\n💵 *Total Amount:* $${order.total.toFixed(0)}\n\n`;
  if (order.customer && order.customer.name) {
    text += `📍 *Customer Details:*\n`;
    text += `👤 *Name:* ${order.customer.name}\n`;
    if (order.customer.phone) text += `📞 *Phone:* ${order.customer.phone}\n`;
    if (order.customer.address) text += `🏠 *Address:* ${order.customer.address}, ${order.customer.city || ""}\n\n`;
  }
  text += `Please confirm my order and share delivery details. Thank you!`;
  return text;
}

