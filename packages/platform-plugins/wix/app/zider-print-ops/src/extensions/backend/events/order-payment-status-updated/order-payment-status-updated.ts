import { orders } from "@wix/ecom";
import { forwardWixOrderEventSafely } from "../shared/forward-wix-order-event";

export default orders.onOrderPaymentStatusUpdated((event) =>
  forwardWixOrderEventSafely("wix.ecom.v1.order_payment_status_updated", event),
);
