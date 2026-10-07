-- DashKirana Product Catalog Seed Script
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/casuaxzvhxqwqajysznh/sql)
-- to populate all initial store products into your database.

INSERT INTO public.products (name, slug, category_id, description, price, mrp, stock, unit, image_url, featured, active)
VALUES
(
  'Aashirvaad Shuddh Chakki Atta',
  'aashirvaad-atta-5kg',
  (SELECT id FROM public.categories WHERE slug = 'rice-grains' LIMIT 1),
  '100% pure wheat flour processed through traditional chakki method.',
  245, 280, 25, '5 kg', '🌾', true, true
),
(
  'India Gate Basmati Rice Feast Rozzana',
  'india-gate-basmati-rice-5kg',
  (SELECT id FROM public.categories WHERE slug = 'rice-grains' LIMIT 1),
  'Long grain aromatic basmati rice ideal for everyday meals.',
  320, 360, 18, '5 kg', '🍚', true, true
),
(
  'Fortune Sunlite Sunflower Oil',
  'fortune-sunflower-oil-1l',
  (SELECT id FROM public.categories WHERE slug = 'oils' LIMIT 1),
  'Refined sunflower cooking oil enriched with vitamins A & D.',
  145, 170, 30, '1 litre', '🌻', true, true
),
(
  'Tata Salt Iodized',
  'tata-salt-1kg',
  (SELECT id FROM public.categories WHERE slug = 'rice-grains' LIMIT 1),
  'Vacuum evaporated iodized salt for everyday healthy cooking.',
  28, 30, 45, '1 kg', '🧂', false, true
),
(
  'Parle-G Gold Biscuits',
  'parle-g-1pack',
  (SELECT id FROM public.categories WHERE slug = 'snacks' LIMIT 1),
  'India''s favorite glucose biscuits packed with energy.',
  10, 10, 50, '1 packet', '🍪', false, true
),
(
  'Amul Taaza Toned Milk',
  'amul-milk-500ml',
  (SELECT id FROM public.categories WHERE slug = 'dairy' LIMIT 1),
  'Fresh pasteurized toned milk, rich in calcium.',
  32, 32, 15, '500 ml', '🥛', true, true
),
(
  'Tata Tea Gold Premium Black Tea',
  'tata-tea-gold-250g',
  (SELECT id FROM public.categories WHERE slug = 'beverages' LIMIT 1),
  'Blend of rich tea leaves and gentle long leaves for great aroma.',
  145, 160, 15, '250 g', '☕', true, true
),
(
  'Maggi 2-Minute Masala Noodles',
  'maggi-noodles-packet',
  (SELECT id FROM public.categories WHERE slug = 'snacks' LIMIT 1),
  'Classic instant noodles with rich aromatic spices.',
  14, 14, 40, '1 packet', '🍜', true, true
),
(
  'Tata Sampann Toor Dal',
  'tata-sampann-toor-dal-1kg',
  (SELECT id FROM public.categories WHERE slug = 'dals' LIMIT 1),
  'Unpolished protein-rich toor dal sourced responsibly.',
  165, 185, 22, '1 kg', '🍲', false, true
),
(
  'Fresh Farm Onions (Pyaz)',
  'fresh-onions-1kg',
  (SELECT id FROM public.categories WHERE slug = 'fruits-vegetables' LIMIT 1),
  'Fresh quality locally grown red onions.',
  35, 40, 30, '1 kg', '🧅', false, true
),
(
  'Fresh Farm Potatoes (Aloo)',
  'fresh-potatoes-1kg',
  (SELECT id FROM public.categories WHERE slug = 'fruits-vegetables' LIMIT 1),
  'Clean and solid baking and curry potatoes.',
  28, 35, 35, '1 kg', '🥔', false, true
),
(
  'Dettol Original Bathing Soap Bar',
  'dettol-soap-75g',
  (SELECT id FROM public.categories WHERE slug = 'personal-care' LIMIT 1),
  'Trusted germ protection soap for daily skin hygiene.',
  38, 42, 20, '75 g', '🧼', false, true
),
(
  'Vim Dishwash Gel Lemon',
  'vim-gel-250ml',
  (SELECT id FROM public.categories WHERE slug = 'household' LIMIT 1),
  'Powerful grease-removing dishwash gel with real lemon juice.',
  55, 60, 14, '250 ml', '🍋', false, true
),
(
  'Sona Masoori Raw Rice',
  'sona-masoori-rice-5kg',
  (SELECT id FROM public.categories WHERE slug = 'rice-grains' LIMIT 1),
  'Medium grain lightweight rice popular in South Indian households.',
  290, 320, 12, '5 kg', '🌾', true, true
),
(
  'Freedom Refined Sunflower Oil',
  'freedom-oil-1l',
  (SELECT id FROM public.categories WHERE slug = 'oils' LIMIT 1),
  'Light and healthy cooking oil for everyday fry & curry preparation.',
  140, 160, 19, '1 litre', '🌻', false, true
)
ON CONFLICT (slug) DO NOTHING;
