# DashKirana — Production Handover

DashKirana is a mobile-first grocery ordering website with a Supabase-backed customer account system and protected shop-admin panel.

## Production architecture

- Next.js 14
- Supabase Auth
- Supabase PostgreSQL + Row Level Security
- Vercel-ready
- Customer login: India phone OTP through Supabase Phone Auth
- Admin login: Supabase email/password + `profiles.role = 'admin'`
- Orders: stored in Supabase
- Products/inventory: stored in Supabase
- Cash on Delivery: supported

There is **no demo login or demo OTP fallback in this production build**.

## Supabase setup

1. Create the client's Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor.
3. Configure Supabase Phone Auth and the SMS provider for Indian numbers.
4. Create the shop owner's user in Supabase Authentication using email/password.
5. Find that user's UUID in Authentication and run:

```sql
update public.profiles
set role = 'admin'
where id = 'SHOP_OWNER_AUTH_USER_UUID';
```

6. Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_DATA_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

7. Install and test:

```bash
npm install
npm run build
npm run dev
```

## Client handover checklist

### Customer
- `/` store
- `/products` catalog
- `/cart` cart
- `/checkout` checkout
- `/login` phone OTP login
- `/orders` order history
- `/account` customer account

### Admin
- `/admin/login` secure admin login
- `/admin` dashboard
- `/admin/products` product management
- `/admin/products/new` add products
- `/admin/products/[id]` edit products
- `/admin/inventory` stock management
- `/admin/orders` order management
- `/admin/customers` customer directory

### Before going live
- Replace sample product/catalog data with the client's actual catalog.
- Configure the client's SMS provider in Supabase Phone Auth.
- Configure the real store address, phone number, delivery area and delivery fee.
- Verify RLS policies in Supabase.
- Test customer registration, OTP verification, checkout, order creation and admin order updates.
- Deploy to Vercel and add the client's domain.
- Never expose a Supabase service-role key in frontend code.

## Payments

Cash on Delivery is implemented. The existing online-payment option is a UI placeholder and should not be presented as a completed online payment integration until a gateway such as Razorpay is connected and verified.
