"""
Stripe Client for AURA Billing
Σₛ = dna::}{::lang
"""

import os
from typing import Optional, Dict, Any, List
import stripe
from datetime import datetime


class StripeClient:
    """Singleton Stripe client for billing and usage tracking"""

    _instance: Optional['StripeClient'] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if not self._initialized:
            stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')
            if not stripe.api_key:
                raise RuntimeError("STRIPE_SECRET_KEY not found in environment")
            self._initialized = True

    # ==========================================
    # Customer Management
    # ==========================================

    async def create_customer(
        self,
        email: str,
        user_id: str,
        name: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> stripe.Customer:
        """
        Create a Stripe customer

        Args:
            email: Customer email
            user_id: User ID from Supabase
            name: Optional customer name
            metadata: Optional metadata

        Returns:
            Stripe Customer object
        """
        customer_metadata = metadata or {}
        customer_metadata['user_id'] = user_id

        return stripe.Customer.create(
            email=email,
            name=name,
            metadata=customer_metadata
        )

    async def get_customer(self, customer_id: str) -> Optional[stripe.Customer]:
        """Get customer by Stripe customer ID"""
        try:
            return stripe.Customer.retrieve(customer_id)
        except stripe.error.StripeError as e:
            print(f"Failed to get customer: {e}")
            return None

    async def get_customer_by_user_id(self, user_id: str) -> Optional[stripe.Customer]:
        """Get customer by user ID (from metadata)"""
        try:
            customers = stripe.Customer.list(limit=1, email=user_id)
            return customers.data[0] if customers.data else None
        except stripe.error.StripeError as e:
            print(f"Failed to find customer: {e}")
            return None

    # ==========================================
    # Usage-Based Billing
    # ==========================================

    async def create_usage_record(
        self,
        subscription_item_id: str,
        quantity: int,
        timestamp: Optional[int] = None,
        action: str = "increment"
    ) -> stripe.UsageRecord:
        """
        Create a usage record for metered billing

        Args:
            subscription_item_id: Stripe subscription item ID
            quantity: Quantity to bill (e.g., number of agent calls)
            timestamp: Optional Unix timestamp (defaults to now)
            action: 'increment' or 'set'

        Returns:
            Stripe UsageRecord object
        """
        return stripe.SubscriptionItem.create_usage_record(
            subscription_item_id,
            quantity=quantity,
            timestamp=timestamp or int(datetime.utcnow().timestamp()),
            action=action
        )

    async def get_usage_records(
        self,
        subscription_item_id: str,
        limit: int = 100
    ) -> List[stripe.UsageRecord]:
        """Get usage records for a subscription item"""
        try:
            records = stripe.SubscriptionItem.list_usage_record_summaries(
                subscription_item_id,
                limit=limit
            )
            return records.data
        except stripe.error.StripeError as e:
            print(f"Failed to get usage records: {e}")
            return []

    # ==========================================
    # Subscription Management
    # ==========================================

    async def create_subscription(
        self,
        customer_id: str,
        price_id: str,
        metadata: Optional[Dict[str, str]] = None
    ) -> stripe.Subscription:
        """
        Create a subscription for a customer

        Args:
            customer_id: Stripe customer ID
            price_id: Stripe price ID
            metadata: Optional metadata

        Returns:
            Stripe Subscription object
        """
        return stripe.Subscription.create(
            customer=customer_id,
            items=[{'price': price_id}],
            metadata=metadata or {}
        )

    async def get_subscription(self, subscription_id: str) -> Optional[stripe.Subscription]:
        """Get subscription by ID"""
        try:
            return stripe.Subscription.retrieve(subscription_id)
        except stripe.error.StripeError as e:
            print(f"Failed to get subscription: {e}")
            return None

    async def cancel_subscription(
        self,
        subscription_id: str,
        at_period_end: bool = True
    ) -> stripe.Subscription:
        """Cancel a subscription"""
        return stripe.Subscription.modify(
            subscription_id,
            cancel_at_period_end=at_period_end
        )

    # ==========================================
    # Payment Methods
    # ==========================================

    async def attach_payment_method(
        self,
        customer_id: str,
        payment_method_id: str
    ) -> stripe.PaymentMethod:
        """Attach payment method to customer"""
        return stripe.PaymentMethod.attach(
            payment_method_id,
            customer=customer_id
        )

    async def set_default_payment_method(
        self,
        customer_id: str,
        payment_method_id: str
    ) -> stripe.Customer:
        """Set default payment method for customer"""
        return stripe.Customer.modify(
            customer_id,
            invoice_settings={'default_payment_method': payment_method_id}
        )

    # ==========================================
    # Invoices
    # ==========================================

    async def create_invoice(
        self,
        customer_id: str,
        auto_advance: bool = True
    ) -> stripe.Invoice:
        """Create an invoice for a customer"""
        return stripe.Invoice.create(
            customer=customer_id,
            auto_advance=auto_advance
        )

    async def get_upcoming_invoice(self, customer_id: str) -> Optional[stripe.Invoice]:
        """Get upcoming invoice for customer"""
        try:
            return stripe.Invoice.upcoming(customer=customer_id)
        except stripe.error.StripeError as e:
            print(f"Failed to get upcoming invoice: {e}")
            return None

    async def get_invoices(
        self,
        customer_id: str,
        limit: int = 10
    ) -> List[stripe.Invoice]:
        """Get invoices for a customer"""
        try:
            invoices = stripe.Invoice.list(customer=customer_id, limit=limit)
            return invoices.data
        except stripe.error.StripeError as e:
            print(f"Failed to get invoices: {e}")
            return []

    # ==========================================
    # Products & Prices
    # ==========================================

    async def create_product(
        self,
        name: str,
        description: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> stripe.Product:
        """Create a product"""
        return stripe.Product.create(
            name=name,
            description=description,
            metadata=metadata or {}
        )

    async def create_price(
        self,
        product_id: str,
        unit_amount: Optional[int] = None,
        currency: str = "usd",
        recurring: Optional[Dict[str, Any]] = None,
        billing_scheme: str = "per_unit"
    ) -> stripe.Price:
        """
        Create a price for a product

        Args:
            product_id: Stripe product ID
            unit_amount: Price in cents (None for metered billing)
            currency: Currency code (default: usd)
            recurring: Recurring billing config (e.g., {'interval': 'month'})
            billing_scheme: 'per_unit' or 'tiered'

        Returns:
            Stripe Price object
        """
        price_data = {
            'product': product_id,
            'currency': currency,
            'billing_scheme': billing_scheme
        }

        if unit_amount is not None:
            price_data['unit_amount'] = unit_amount

        if recurring:
            price_data['recurring'] = recurring

        return stripe.Price.create(**price_data)

    # ==========================================
    # Webhook Verification
    # ==========================================

    def verify_webhook_signature(
        self,
        payload: bytes,
        signature: str,
        webhook_secret: Optional[str] = None
    ) -> stripe.Event:
        """
        Verify webhook signature and return event

        Args:
            payload: Raw request body
            signature: Stripe-Signature header value
            webhook_secret: Webhook secret (defaults to env var)

        Returns:
            Stripe Event object

        Raises:
            stripe.error.SignatureVerificationError: If signature invalid
        """
        secret = webhook_secret or os.environ.get('STRIPE_WEBHOOK_SECRET')
        if not secret:
            raise RuntimeError("STRIPE_WEBHOOK_SECRET not found")

        return stripe.Webhook.construct_event(
            payload, signature, secret
        )


# Global instance
_stripe_client: Optional[StripeClient] = None


def get_stripe_client() -> StripeClient:
    """Get or create Stripe client singleton"""
    global _stripe_client
    if _stripe_client is None:
        _stripe_client = StripeClient()
    return _stripe_client
