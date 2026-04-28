import {supabase} from "../../../lib/supabaseClient";

export const trackEvent = async ({
  eventType,
  productId,
  variantId = null,
  quantity = null,
  userId = null,
  sessionId,
  metadata = {},
}) => {
  try {
    await supabase.functions.invoke("track_event", {
      body: {
        event_type: eventType,
        product_id: productId,
        variant_id: variantId,
        quantity,
        user_id: userId,
        session_id: sessionId,
        metadata,
      },
    });
  } catch (err) {
    console.error("Tracking failed:", err);
  }
};



// 👀 Product view
// trackProductEvent({
//   eventType: "view_product",
//   productId,
//   sessionId,
// });