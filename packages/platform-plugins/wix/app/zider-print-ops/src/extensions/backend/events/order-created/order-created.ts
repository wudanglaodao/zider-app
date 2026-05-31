import { orders } from "@wix/ecom";
import { forwardWixOrderEventSafely } from "../shared/forward-wix-order-event";

export default orders.onOrderCreated((event) => forwardWixOrderEventSafely("wix.ecom.v1.order_created", event));
