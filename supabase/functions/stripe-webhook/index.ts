import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature || !webhookSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`Webhook received: ${event.type}`);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { user_id, pack_id, credits } = session.metadata || {};

      if (!user_id || !credits) {
        console.error("Missing metadata in session");
        return new Response("Missing metadata", { status: 400 });
      }

      console.log(`Processing payment for user ${user_id}: ${credits} credits`);

      // Add credits
      const { error: creditError } = await supabaseClient.rpc("add_credits", {
        _user_id: user_id,
        _amount: parseInt(credits),
        _transaction_type: "purchase",
        _reference_id: session.id,
      });

      if (creditError) {
        console.error("Error adding credits:", creditError);
        throw creditError;
      }

      // Record purchase
      const { error: purchaseError } = await supabaseClient
        .from("purchases")
        .insert({
          user_id,
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
          pack_name: pack_id || "unknown",
          credits_purchased: parseInt(credits),
          amount_cents: session.amount_total || 0,
          currency: session.currency || "eur",
          status: "completed",
          completed_at: new Date().toISOString(),
        });

      if (purchaseError) {
        console.error("Error recording purchase:", purchaseError);
      }

      console.log(`Credits added successfully for user ${user_id}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
