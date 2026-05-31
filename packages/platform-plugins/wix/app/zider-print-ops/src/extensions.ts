import { app } from '@wix/astro/builders';
import orderApproved from './extensions/backend/events/order-approved/order-approved.extension.ts';
import orderCanceled from './extensions/backend/events/order-canceled/order-canceled.extension.ts';
import orderCommitted from './extensions/backend/events/order-committed/order-committed.extension.ts';
import orderCreated from './extensions/backend/events/order-created/order-created.extension.ts';
import orderFulfilled from './extensions/backend/events/order-fulfilled/order-fulfilled.extension.ts';
import orderPaymentStatusUpdated from './extensions/backend/events/order-payment-status-updated/order-payment-status-updated.extension.ts';
import orderUpdated from './extensions/backend/events/order-updated/order-updated.extension.ts';
import catalog from './extensions/dashboard/pages/catalog/catalog.extension.ts';

export default app()
  .use(catalog)
  .use(orderCreated)
  .use(orderUpdated)
  .use(orderApproved)
  .use(orderCanceled)
  .use(orderFulfilled)
  .use(orderPaymentStatusUpdated)
  .use(orderCommitted)
