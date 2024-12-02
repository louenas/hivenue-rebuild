const stripe = require('../config/stripe');

const createInvoice = async (booking) => {
  try {
    // Create an invoice item for the booking amount
    const invoiceItem = await stripe.invoiceItems.create({
      customer: booking.tenant.stripeCustomerId,
      amount: Math.round(booking.amount * 100), // Convert to cents
      currency: 'usd',
      description: `Invoice for booking ID: ${booking._id}`,
    });

    console.log(`Invoice item created: ${invoiceItem.id}`);

    // Create the invoice
    const invoice = await stripe.invoices.create({
      customer: booking.tenant.stripeCustomerId,
      pending_invoice_items_behavior: 'include',
      collection_method: 'send_invoice',
      days_until_due: 0, // Due immediately
      auto_advance: false, // Disable auto finalization (handle it manually)
    });

    console.log(`Invoice created: ${invoice.id}`);

    // Now, finalize the invoice to ensure the items are attached
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    console.log(`Invoice finalized: ${finalizedInvoice.id}`);

    // Send the invoice after finalization
    await stripe.invoices.sendInvoice(finalizedInvoice.id);

    console.log(`Invoice sent: ${finalizedInvoice.id}`);

    return finalizedInvoice; // Return the created and sent invoice
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error; // Handle errors appropriately
  }
};

module.exports = {
  createInvoice,
};