import { orders } from "@wix/ecom";
import { forwardWixOrderEventSafely } from "../shared/forward-wix-order-event";

export default orders.onOrderApproved((event) => forwardWixOrderEventSafely("wix.ecom.v1.order_approved", event));
