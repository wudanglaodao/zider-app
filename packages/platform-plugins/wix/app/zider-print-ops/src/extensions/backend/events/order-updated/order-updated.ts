import { orders } from "@wix/ecom";
import { forwardWixOrderEventSafely } from "../shared/forward-wix-order-event";

export default orders.onOrderUpdated((event) => forwardWixOrderEventSafely("wix.ecom.v1.order_updated", event));
