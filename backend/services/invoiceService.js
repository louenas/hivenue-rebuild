const stripe = require('../utils/stripe');

async function createInvoice(booking) {
  const { tenant, amount, startDate, endDate } = booking;

  // First, create an invoice item
  await stripe.invoiceItems.create({
    customer: tenant.stripeCustomerId,
    amount: amount * 100, // Amount in cents
    currency: 'usd',
    description: `Rent payment for the period from ${startDate} to ${endDate}`,
  });

  const invoiceData = {
    customer: tenant.stripeCustomerId,
    collection_method: 'send_invoice',
    auto_advance: false, // Prevent auto-finalization
    days_until_due: 30,
    metadata: {
      bookingId: booking._id.toString(),
    },
    pending_invoice_items_behavior: 'include',
  };

  // Create the invoice (it will automatically include all pending invoice items)
  const invoice = await stripe.invoices.create(invoiceData);

  return invoice;
}

module.exports = {
  createInvoice,
};