begin;

create extension if not exists pgcrypto;

alter table public.categories
  add column if not exists description text,
  add column if not exists is_active boolean not null default true,
  add column if not exists sort_order integer not null default 1000,
  add column if not exists taxonomy_level integer not null default 1,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.products
  add column if not exists subcategory_id uuid references public.categories(id) on delete set null;

create index if not exists categories_parent_sort_idx
  on public.categories(parent_id, sort_order, name);

create index if not exists categories_active_slug_idx
  on public.categories(is_active, slug);

create index if not exists products_subcategory_idx
  on public.products(subcategory_id);

create or replace function public.normalize_category_slug(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select regexp_replace(
    regexp_replace(lower(trim(coalesce(value, ''))), '[^a-z0-9]+', '-', 'g'),
    '(^-|-$)',
    '',
    'g'
  );
$$;

create temporary table taxonomy_seed (
  sort_order integer not null,
  path text[] not null,
  description text
) on commit drop;

insert into taxonomy_seed (sort_order, path, description)
values
  (100, array['Fashion & Apparel'], 'Everyday clothing, occasion wear, footwear, bags, accessories, and style essentials for men, women, and children.'),
  (110, array['Fashion & Apparel','Men'], null),
  (111, array['Fashion & Apparel','Men','Shirts'], null),
  (112, array['Fashion & Apparel','Men','T-Shirts'], null),
  (113, array['Fashion & Apparel','Men','Polos'], null),
  (114, array['Fashion & Apparel','Men','Trousers'], null),
  (115, array['Fashion & Apparel','Men','Jeans'], null),
  (116, array['Fashion & Apparel','Men','Shorts'], null),
  (117, array['Fashion & Apparel','Men','Suits'], null),
  (118, array['Fashion & Apparel','Men','Blazers'], null),
  (119, array['Fashion & Apparel','Men','Native Wear'], null),
  (120, array['Fashion & Apparel','Men','Hoodies & Sweatshirts'], null),
  (121, array['Fashion & Apparel','Men','Jackets & Coats'], null),
  (122, array['Fashion & Apparel','Men','Underwear'], null),
  (123, array['Fashion & Apparel','Men','Sleepwear'], null),
  (124, array['Fashion & Apparel','Men','Shoes'], null),
  (125, array['Fashion & Apparel','Men','Watches'], null),
  (126, array['Fashion & Apparel','Men','Jewelry'], null),
  (127, array['Fashion & Apparel','Men','Bags'], null),
  (128, array['Fashion & Apparel','Men','Belts'], null),
  (129, array['Fashion & Apparel','Men','Sunglasses'], null),
  (130, array['Fashion & Apparel','Women'], null),
  (131, array['Fashion & Apparel','Women','Dresses'], null),
  (132, array['Fashion & Apparel','Women','Tops'], null),
  (133, array['Fashion & Apparel','Women','Blouses'], null),
  (134, array['Fashion & Apparel','Women','Skirts'], null),
  (135, array['Fashion & Apparel','Women','Trousers'], null),
  (136, array['Fashion & Apparel','Women','Jeans'], null),
  (137, array['Fashion & Apparel','Women','Jumpsuits'], null),
  (138, array['Fashion & Apparel','Women','Jackets'], null),
  (139, array['Fashion & Apparel','Women','Lingerie'], null),
  (140, array['Fashion & Apparel','Women','Sleepwear'], null),
  (141, array['Fashion & Apparel','Women','Shoes'], null),
  (142, array['Fashion & Apparel','Women','Bags'], null),
  (143, array['Fashion & Apparel','Women','Watches'], null),
  (144, array['Fashion & Apparel','Women','Jewelry'], null),
  (145, array['Fashion & Apparel','Women','Hair Accessories'], null),
  (146, array['Fashion & Apparel','Women','Sunglasses'], null),
  (150, array['Fashion & Apparel','Kids'], null),
  (151, array['Fashion & Apparel','Kids','Boys Clothing'], null),
  (152, array['Fashion & Apparel','Kids','Girls Clothing'], null),
  (153, array['Fashion & Apparel','Kids','Baby Clothing'], null),
  (154, array['Fashion & Apparel','Kids','Shoes'], null),
  (155, array['Fashion & Apparel','Kids','School Wear'], null),
  (160, array['Fashion & Apparel','Other Fashion'], null),
  (161, array['Fashion & Apparel','Other Fashion','Activewear & Gym Wear'], null),
  (162, array['Fashion & Apparel','Other Fashion','Swimwear'], null),
  (163, array['Fashion & Apparel','Other Fashion','Cultural Wear'], null),
  (164, array['Fashion & Apparel','Other Fashion','Fashion Accessories'], null),
  (165, array['Fashion & Apparel','Other Fashion','Luxury Fashion'], null),

  (200, array['Sneakers & Footwear'], 'Footwear for sport, work, formal occasions, casual wear, and shoe care.'),
  (201, array['Sneakers & Footwear','Sneakers'], null),
  (202, array['Sneakers & Footwear','Running Shoes'], null),
  (203, array['Sneakers & Footwear','Basketball Shoes'], null),
  (204, array['Sneakers & Footwear','Football Boots'], null),
  (205, array['Sneakers & Footwear','Sandals'], null),
  (206, array['Sneakers & Footwear','Slippers'], null),
  (207, array['Sneakers & Footwear','Loafers'], null),
  (208, array['Sneakers & Footwear','Formal Shoes'], null),
  (209, array['Sneakers & Footwear','Safety Shoes'], null),
  (210, array['Sneakers & Footwear','Shoe Care'], null),

  (300, array['Electronics'], 'Phones, tablets, audio, wearables, cameras, and essential electronic accessories.'),
  (310, array['Electronics','Phones'], null),
  (311, array['Electronics','Phones','Android Phones'], null),
  (312, array['Electronics','Phones','iPhones'], null),
  (313, array['Electronics','Phones','Feature Phones'], null),
  (320, array['Electronics','Tablets'], null),
  (321, array['Electronics','Tablets','Android Tablets'], null),
  (322, array['Electronics','Tablets','iPads'], null),
  (330, array['Electronics','Audio'], null),
  (331, array['Electronics','Audio','Earbuds'], null),
  (332, array['Electronics','Audio','Headphones'], null),
  (333, array['Electronics','Audio','Speakers'], null),
  (334, array['Electronics','Audio','Soundbars'], null),
  (340, array['Electronics','Accessories'], null),
  (341, array['Electronics','Accessories','Chargers'], null),
  (342, array['Electronics','Accessories','Power Banks'], null),
  (343, array['Electronics','Accessories','Cables'], null),
  (344, array['Electronics','Accessories','Cases'], null),
  (345, array['Electronics','Accessories','Screen Protectors'], null),
  (350, array['Electronics','Wearables'], null),
  (351, array['Electronics','Wearables','Smart Watches'], null),
  (352, array['Electronics','Wearables','Fitness Bands'], null),
  (360, array['Electronics','Cameras'], null),
  (361, array['Electronics','Cameras','Cameras'], null),
  (362, array['Electronics','Cameras','Lenses'], null),
  (363, array['Electronics','Cameras','Drones'], null),

  (400, array['Computers & Accessories'], 'Computers, components, peripherals, networking hardware, and storage devices.'),
  (410, array['Computers & Accessories','Computers'], null),
  (411, array['Computers & Accessories','Computers','Laptops'], null),
  (412, array['Computers & Accessories','Computers','Desktops'], null),
  (413, array['Computers & Accessories','Computers','Mini PCs'], null),
  (420, array['Computers & Accessories','Components'], null),
  (421, array['Computers & Accessories','Components','RAM'], null),
  (422, array['Computers & Accessories','Components','SSD'], null),
  (423, array['Computers & Accessories','Components','HDD'], null),
  (424, array['Computers & Accessories','Components','GPU'], null),
  (425, array['Computers & Accessories','Components','CPU'], null),
  (426, array['Computers & Accessories','Components','Motherboards'], null),
  (427, array['Computers & Accessories','Components','Power Supplies'], null),
  (430, array['Computers & Accessories','Peripherals'], null),
  (431, array['Computers & Accessories','Peripherals','Keyboards'], null),
  (432, array['Computers & Accessories','Peripherals','Mouse'], null),
  (433, array['Computers & Accessories','Peripherals','Monitors'], null),
  (434, array['Computers & Accessories','Peripherals','Printers'], null),
  (435, array['Computers & Accessories','Peripherals','Webcams'], null),
  (440, array['Computers & Accessories','Networking'], null),
  (441, array['Computers & Accessories','Networking','Routers'], null),
  (442, array['Computers & Accessories','Networking','Modems'], null),
  (443, array['Computers & Accessories','Networking','Switches'], null),
  (444, array['Computers & Accessories','Networking','Access Points'], null),
  (450, array['Computers & Accessories','Storage'], null),
  (451, array['Computers & Accessories','Storage','Flash Drives'], null),
  (452, array['Computers & Accessories','Storage','External Drives'], null),
  (453, array['Computers & Accessories','Storage','Memory Cards'], null),

  (500, array['Home & Living'], 'Furniture, kitchen items, decor, bedding, and home improvement supplies.'),
  (510, array['Home & Living','Furniture'], null),
  (511, array['Home & Living','Furniture','Living Room'], null),
  (512, array['Home & Living','Furniture','Bedroom'], null),
  (513, array['Home & Living','Furniture','Dining'], null),
  (514, array['Home & Living','Furniture','Office Furniture'], null),
  (520, array['Home & Living','Kitchen'], null),
  (521, array['Home & Living','Kitchen','Cookware'], null),
  (522, array['Home & Living','Kitchen','Appliances'], null),
  (523, array['Home & Living','Kitchen','Storage'], null),
  (530, array['Home & Living','Home Decor'], null),
  (531, array['Home & Living','Home Decor','Wall Art'], null),
  (532, array['Home & Living','Home Decor','Rugs'], null),
  (533, array['Home & Living','Home Decor','Curtains'], null),
  (534, array['Home & Living','Home Decor','Lighting'], null),
  (540, array['Home & Living','Bedding'], null),
  (541, array['Home & Living','Bedding','Bedsheets'], null),
  (542, array['Home & Living','Bedding','Pillows'], null),
  (543, array['Home & Living','Bedding','Mattresses'], null),
  (550, array['Home & Living','Home Improvement'], null),
  (551, array['Home & Living','Home Improvement','Tools'], null),
  (552, array['Home & Living','Home Improvement','Fixtures'], null),
  (553, array['Home & Living','Home Improvement','Paint Supplies'], null),

  (600, array['Beauty & Personal Care'], 'Skincare, makeup, haircare, fragrances, grooming, salon items, and beauty tools.'),
  (601, array['Beauty & Personal Care','Skincare'], null),
  (602, array['Beauty & Personal Care','Makeup'], null),
  (603, array['Beauty & Personal Care','Haircare'], null),
  (604, array['Beauty & Personal Care','Fragrances'], null),
  (605, array['Beauty & Personal Care','Men''s Grooming'], null),
  (606, array['Beauty & Personal Care','Salon Equipment'], null),
  (607, array['Beauty & Personal Care','Organic Beauty'], null),
  (608, array['Beauty & Personal Care','Beauty Tools'], null),

  (700, array['Food & Beverages'], 'Groceries, snacks, drinks, fresh foods, packaged foods, organic products, and imported food items.'),
  (701, array['Food & Beverages','Groceries'], null),
  (702, array['Food & Beverages','Snacks'], null),
  (703, array['Food & Beverages','Drinks'], null),
  (704, array['Food & Beverages','Fresh Food'], null),
  (705, array['Food & Beverages','Packaged Food'], null),
  (706, array['Food & Beverages','Organic Food'], null),
  (707, array['Food & Beverages','Imported Food'], null),

  (800, array['Baby, Kids & Maternity'], 'Baby care, children''s essentials, feeding items, nursery furniture, strollers, and maternity products.'),
  (801, array['Baby, Kids & Maternity','Baby Care'], null),
  (802, array['Baby, Kids & Maternity','Baby Clothing'], null),
  (803, array['Baby, Kids & Maternity','Feeding Accessories'], null),
  (804, array['Baby, Kids & Maternity','Baby Furniture'], null),
  (805, array['Baby, Kids & Maternity','Baby Safety'], null),
  (806, array['Baby, Kids & Maternity','Strollers'], null),
  (807, array['Baby, Kids & Maternity','Maternity Wear'], null),
  (808, array['Baby, Kids & Maternity','Maternity Care'], null),

  (900, array['Pets'], 'Pet food, toys, accessories, grooming supplies, and pet health products.'),
  (901, array['Pets','Pet Food'], null),
  (902, array['Pets','Pet Toys'], null),
  (903, array['Pets','Pet Accessories'], null),
  (904, array['Pets','Grooming'], null),
  (905, array['Pets','Pet Health'], null),

  (1000, array['Automotive'], 'Car and motorcycle parts, accessories, electronics, care items, and automotive tools.'),
  (1001, array['Automotive','Car Parts'], null),
  (1002, array['Automotive','Car Electronics'], null),
  (1003, array['Automotive','Car Accessories'], null),
  (1004, array['Automotive','Car Care'], null),
  (1005, array['Automotive','Motorcycle Parts'], null),
  (1006, array['Automotive','Motorcycle Accessories'], null),
  (1007, array['Automotive','Automotive Tools'], null),

  (1100, array['Sports & Fitness'], 'Fitness equipment, sportswear, sport-specific gear, outdoor products, and tracking devices.'),
  (1101, array['Sports & Fitness','Gym Equipment'], null),
  (1102, array['Sports & Fitness','Sportswear'], null),
  (1103, array['Sports & Fitness','Football'], null),
  (1104, array['Sports & Fitness','Basketball'], null),
  (1105, array['Sports & Fitness','Cycling'], null),
  (1106, array['Sports & Fitness','Running'], null),
  (1107, array['Sports & Fitness','Outdoor & Camping'], null),
  (1108, array['Sports & Fitness','Fitness Trackers'], null),

  (1200, array['Health & Wellness'], 'Supplements, vitamins, medical supplies, first aid products, mobility aids, and wellness devices.'),
  (1201, array['Health & Wellness','Supplements'], null),
  (1202, array['Health & Wellness','Vitamins'], null),
  (1203, array['Health & Wellness','Medical Supplies'], null),
  (1204, array['Health & Wellness','First Aid'], null),
  (1205, array['Health & Wellness','Mobility Aids'], null),
  (1206, array['Health & Wellness','Fitness Devices'], null),

  (1300, array['Office, School & Business'], 'Stationery, office equipment, school supplies, printers, furniture, packaging, and business essentials.'),
  (1301, array['Office, School & Business','Stationery'], null),
  (1302, array['Office, School & Business','Office Equipment'], null),
  (1303, array['Office, School & Business','School Supplies'], null),
  (1304, array['Office, School & Business','Printers'], null),
  (1305, array['Office, School & Business','Office Furniture'], null),
  (1306, array['Office, School & Business','Packaging Materials'], null),
  (1307, array['Office, School & Business','Business Supplies'], null),

  (1400, array['Gaming & Entertainment'], 'Consoles, games, gaming accessories, VR devices, and streaming equipment.'),
  (1401, array['Gaming & Entertainment','Consoles'], null),
  (1402, array['Gaming & Entertainment','Video Games'], null),
  (1403, array['Gaming & Entertainment','Gaming Accessories'], null),
  (1404, array['Gaming & Entertainment','VR Devices'], null),
  (1405, array['Gaming & Entertainment','Streaming Equipment'], null),

  (1500, array['Industrial & Tools'], 'Power tools, hand tools, construction tools, electrical tools, safety gear, and equipment accessories.'),
  (1501, array['Industrial & Tools','Power Tools'], null),
  (1502, array['Industrial & Tools','Hand Tools'], null),
  (1503, array['Industrial & Tools','Construction Tools'], null),
  (1504, array['Industrial & Tools','Electrical Tools'], null),
  (1505, array['Industrial & Tools','Safety Gear'], null),
  (1506, array['Industrial & Tools','Heavy Equipment Accessories'], null),

  (1600, array['Audio & Music'], 'Musical instruments, studio equipment, DJ gear, microphones, mixers, and professional speakers.'),
  (1601, array['Audio & Music','Musical Instruments'], null),
  (1602, array['Audio & Music','Studio Equipment'], null),
  (1603, array['Audio & Music','DJ Equipment'], null),
  (1604, array['Audio & Music','Microphones'], null),
  (1605, array['Audio & Music','Mixers'], null),
  (1606, array['Audio & Music','Professional Speakers'], null),

  (1700, array['Travel & Luggage'], 'Suitcases, backpacks, travel bags, accessories, and luggage organizers.'),
  (1701, array['Travel & Luggage','Suitcases'], null),
  (1702, array['Travel & Luggage','Backpacks'], null),
  (1703, array['Travel & Luggage','Travel Bags'], null),
  (1704, array['Travel & Luggage','Travel Accessories'], null),
  (1705, array['Travel & Luggage','Travel Organizers'], null),

  (1800, array['Luxury'], 'Designer fashion, luxury watches, jewelry, collectibles, and premium accessories.'),
  (1801, array['Luxury','Designer Fashion'], null),
  (1802, array['Luxury','Luxury Watches'], null),
  (1803, array['Luxury','Jewelry'], null),
  (1804, array['Luxury','Collectibles'], null),
  (1805, array['Luxury','Premium Accessories'], null),

  (1900, array['Digital Products'], 'Software licenses, ebooks, courses, templates, design assets, digital art, gift cards, and subscriptions.'),
  (1901, array['Digital Products','Software Licenses'], null),
  (1902, array['Digital Products','E-books'], null),
  (1903, array['Digital Products','Online Courses'], null),
  (1904, array['Digital Products','Templates'], null),
  (1905, array['Digital Products','Design Assets'], null),
  (1906, array['Digital Products','Digital Art'], null),
  (1907, array['Digital Products','Gift Cards'], null),
  (1908, array['Digital Products','Subscriptions'], null),

  (2000, array['Services Marketplace'], 'Home repairs, cleaning, installation, freelance work, printing, delivery, professional, and event services.'),
  (2001, array['Services Marketplace','Home Repairs'], null),
  (2002, array['Services Marketplace','Cleaning Services'], null),
  (2003, array['Services Marketplace','Installation Services'], null),
  (2004, array['Services Marketplace','Freelance Services'], null),
  (2005, array['Services Marketplace','Printing Services'], null),
  (2006, array['Services Marketplace','Delivery Services'], null),
  (2007, array['Services Marketplace','Professional Services'], null),
  (2008, array['Services Marketplace','Event Services'], null),

  (2100, array['Arts, Crafts & Handmade'], 'Handmade goods, paintings, craft materials, sewing supplies, custom products, and art supplies.'),
  (2101, array['Arts, Crafts & Handmade','Handmade Products'], null),
  (2102, array['Arts, Crafts & Handmade','Paintings'], null),
  (2103, array['Arts, Crafts & Handmade','Craft Materials'], null),
  (2104, array['Arts, Crafts & Handmade','Sewing Supplies'], null),
  (2105, array['Arts, Crafts & Handmade','Custom Products'], null),
  (2106, array['Arts, Crafts & Handmade','Art Supplies'], null),

  (2200, array['Packaging & Logistics Supplies'], 'Shipping boxes, courier bags, labels, thermal printers, packaging materials, and warehouse supplies.'),
  (2201, array['Packaging & Logistics Supplies','Shipping Boxes'], null),
  (2202, array['Packaging & Logistics Supplies','Courier Bags'], null),
  (2203, array['Packaging & Logistics Supplies','Labels'], null),
  (2204, array['Packaging & Logistics Supplies','Thermal Printers'], null),
  (2205, array['Packaging & Logistics Supplies','Packaging Materials'], null),
  (2206, array['Packaging & Logistics Supplies','Warehouse Supplies'], null),

  (2300, array['Smart Home & IoT'], 'Smart lights, cameras, locks, plugs, sensors, and home automation devices.'),
  (2301, array['Smart Home & IoT','Smart Lights'], null),
  (2302, array['Smart Home & IoT','Smart Cameras'], null),
  (2303, array['Smart Home & IoT','Smart Locks'], null),
  (2304, array['Smart Home & IoT','Smart Plugs'], null),
  (2305, array['Smart Home & IoT','Smart Sensors'], null),
  (2306, array['Smart Home & IoT','Home Automation Devices'], null),

  (2400, array['Real Estate'], 'Apartments, houses, land, commercial property, rentals, and short lets.'),
  (2401, array['Real Estate','Apartments'], null),
  (2402, array['Real Estate','Houses'], null),
  (2403, array['Real Estate','Land'], null),
  (2404, array['Real Estate','Commercial Property'], null),
  (2405, array['Real Estate','Rentals'], null),
  (2406, array['Real Estate','Short Lets'], null),

  (2500, array['Books, Media & Education'], 'Books, textbooks, comics, magazines, educational materials, and exam preparation resources.'),
  (2501, array['Books, Media & Education','Books'], null),
  (2502, array['Books, Media & Education','Textbooks'], null),
  (2503, array['Books, Media & Education','Comics'], null),
  (2504, array['Books, Media & Education','Magazines'], null),
  (2505, array['Books, Media & Education','Educational Materials'], null),
  (2506, array['Books, Media & Education','Exam Preparation'], null),

  (2600, array['Agriculture & Farming'], 'Seeds, fertilizers, farm equipment, livestock supplies, irrigation equipment, and agro chemicals.'),
  (2601, array['Agriculture & Farming','Seeds'], null),
  (2602, array['Agriculture & Farming','Fertilizers'], null),
  (2603, array['Agriculture & Farming','Farm Equipment'], null),
  (2604, array['Agriculture & Farming','Livestock Supplies'], null),
  (2605, array['Agriculture & Farming','Irrigation Equipment'], null),
  (2606, array['Agriculture & Farming','Agro Chemicals'], null),

  (2700, array['Watches & Jewelry'], 'Watches, rings, necklaces, bracelets, earrings, luxury jewelry, and fashion jewelry.'),
  (2701, array['Watches & Jewelry','Watches'], null),
  (2702, array['Watches & Jewelry','Rings'], null),
  (2703, array['Watches & Jewelry','Necklaces'], null),
  (2704, array['Watches & Jewelry','Bracelets'], null),
  (2705, array['Watches & Jewelry','Earrings'], null),
  (2706, array['Watches & Jewelry','Luxury Jewelry'], null),
  (2707, array['Watches & Jewelry','Fashion Jewelry'], null),

  (2800, array['Energy & Solar'], 'Solar panels, inverters, batteries, solar accessories, generators, and power solutions.'),
  (2801, array['Energy & Solar','Solar Panels'], null),
  (2802, array['Energy & Solar','Inverters'], null),
  (2803, array['Energy & Solar','Batteries'], null),
  (2804, array['Energy & Solar','Solar Accessories'], null),
  (2805, array['Energy & Solar','Generators'], null),
  (2806, array['Energy & Solar','Power Solutions'], null);

drop table if exists category_seed_rows;

create temporary table category_seed_rows on commit drop as
with recursive nodes as (
  select
    sort_order,
    path,
    array_length(path, 1) taxonomy_level,
    path[array_length(path, 1)] name,
    public.normalize_category_slug(path[array_length(path, 1)]) natural_slug,
    public.normalize_category_slug(array_to_string(path, '-')) path_slug,
    case
      when array_length(path, 1) = 1 then null::text
      else public.normalize_category_slug(array_to_string(path[1:array_length(path, 1) - 1], '-'))
    end parent_slug,
    coalesce(
      description,
      case
        when array_length(path, 1) = 2 then
          'Browse ' || path[2] || ' selections inside ' || path[1] || '.'
        else
          'Shop ' || path[array_length(path, 1)] || ' products in ' ||
          array_to_string(path[1:array_length(path, 1) - 1], ' / ') || '.'
      end
    ) description
  from taxonomy_seed
),
existing_categories as (
  select distinct on (public.normalize_category_slug(name))
    id,
    name,
    slug,
    public.normalize_category_slug(name) natural_slug
  from public.categories
  order by public.normalize_category_slug(name), parent_id nulls first, id
),
slugged_nodes as (
  select
    nodes.*,
    coalesce(existing.slug, nodes.path_slug) slug
  from nodes
  left join existing_categories existing on existing.natural_slug = nodes.natural_slug
),
ranked_nodes as (
  select
    slugged_nodes.*,
    row_number() over (
      partition by slug
      order by taxonomy_level desc, sort_order asc, array_length(path, 1) desc
    ) slug_rank
  from slugged_nodes
),
ordered_nodes as (
  select *
  from ranked_nodes
  where slug_rank = 1
  order by taxonomy_level, sort_order, slug
),
parent_categories as (
  select distinct on (slug) id, slug
  from public.categories
  order by slug, id
)
select
  insertable_node.name,
  insertable_node.slug,
  insertable_node.parent_slug,
  insertable_node.parent_id,
  insertable_node.description,
  insertable_node.sort_order,
  insertable_node.taxonomy_level,
  insertable_node.metadata
from (
  select distinct on (node.slug)
    node.name,
    node.slug,
    node.parent_slug,
    parent.id parent_id,
    node.description,
    node.sort_order,
    node.taxonomy_level,
    jsonb_build_object(
      'path', node.path,
      'source', '20260606140000_category_subcategory_taxonomy'
    ) metadata
  from ordered_nodes node
  left join parent_categories parent on parent.slug = node.parent_slug
  where node.slug is not null and node.slug <> ''
  order by node.slug, node.taxonomy_level desc, node.sort_order asc
) insertable_node;

update public.categories category
set
  name = seed.name,
  parent_id = seed.parent_id,
  description = seed.description,
  is_active = true,
  sort_order = seed.sort_order,
  taxonomy_level = seed.taxonomy_level,
  metadata = category.metadata || seed.metadata
from category_seed_rows seed
where category.slug = seed.slug;

insert into public.categories (
  name,
  slug,
  parent_id,
  description,
  is_active,
  sort_order,
  taxonomy_level,
  metadata
)
select
  seed.name,
  seed.slug,
  seed.parent_id,
  seed.description,
  true,
  seed.sort_order,
  seed.taxonomy_level,
  seed.metadata
from category_seed_rows seed
where not exists (
  select 1
  from public.categories category
  where category.slug = seed.slug
);

with parent_categories as (
  select distinct on (slug) id, slug
  from public.categories
  order by slug, id
)
update public.categories child
set parent_id = parent.id
from category_seed_rows seed
left join parent_categories parent on parent.slug = seed.parent_slug
where child.slug = seed.slug
  and child.parent_id is distinct from parent.id;

create or replace function public.category_root_id(p_category_id uuid)
returns uuid
language sql
stable
set search_path = ''
as $$
  with recursive ancestors as (
    select id, parent_id
    from public.categories
    where id = p_category_id
    union all
    select parent.id, parent.parent_id
    from public.categories parent
    join ancestors child on child.parent_id = parent.id
  )
  select id
  from ancestors
  where parent_id is null
  limit 1;
$$;

create or replace function public.validate_product_category_selection()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  root_id uuid;
begin
  if new.subcategory_id is null then
    return new;
  end if;

  root_id := public.category_root_id(new.subcategory_id);

  if root_id is null then
    raise exception 'Selected subcategory does not exist.';
  end if;

  if new.category_id is null then
    new.category_id := root_id;
  end if;

  if new.category_id <> root_id then
    raise exception 'Selected subcategory does not belong to the selected category.';
  end if;

  return new;
end;
$$;

drop trigger if exists products_validate_category_selection on public.products;
create trigger products_validate_category_selection
before insert or update of category_id, subcategory_id on public.products
for each row
execute function public.validate_product_category_selection();

create or replace function public.get_category_products(
  p_category_slug text,
  p_subcategory_slug text default null,
  p_limit integer default 48,
  p_offset integer default 0
)
returns setof public.products
language sql
stable
security definer
set search_path = ''
as $$
  with recursive selected_category as (
    select id from public.categories
    where slug = public.normalize_category_slug(p_category_slug)
      and is_active = true
    limit 1
  ),
  descendants as (
    select id from selected_category
    union all
    select child.id
    from public.categories child
    join descendants parent on child.parent_id = parent.id
    where child.is_active = true
  ),
  selected_subcategory as (
    select category.id
    from public.categories category
    where p_subcategory_slug is not null
      and category.slug = public.normalize_category_slug(p_subcategory_slug)
      and category.is_active = true
      and category.id in (select id from descendants)
    limit 1
  )
  select product.*
  from public.products product
  where product.is_active = true
    and (
      exists (select 1 from selected_subcategory)
        and product.subcategory_id = (select id from selected_subcategory)
      or not exists (select 1 from selected_subcategory)
        and (
          product.category_id = (select id from selected_category)
          or product.subcategory_id in (select id from descendants)
        )
    )
  order by product.created_at desc, product.id
  limit greatest(1, least(coalesce(p_limit, 48), 120))
  offset greatest(0, coalesce(p_offset, 0));
$$;

create or replace function public.refresh_product_curations(target_product_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if target_product_id is null then
    return;
  end if;

  delete from public.curation_products
  where product_id = target_product_id
    and source in ('auto', 'taxonomy_auto');

  with base as (
    select
      product.id product_id,
      product.category_id,
      product.subcategory_id,
      category.slug category_slug,
      subcategory.slug subcategory_slug,
      product.created_at,
      coalesce(product.price_minor, 0) price_minor,
      product.sale_price_minor,
      product.sale_ends_at,
      coalesce(product.rating_stars, 0) rating_stars,
      coalesce(product.rating_count, 0) rating_count,
      coalesce(product.is_featured, false) is_featured,
      coalesce(product.keywords, '{}'::text[]) keywords,
      coalesce(metrics.view_count, 0) view_count,
      coalesce(metrics.purchase_count, 0) purchase_count,
      coalesce(metrics.search_count, 0) search_count,
      coalesce(metrics.wishlisted_count, 0) metric_wishlist_count,
      (
        select count(*)
        from public.events event
        where event.product_id = product.id
          and event.event_type in (
            'product_click',
            'view_product',
            'product_detail_viewed',
            'quick_view_opened',
            'add_to_cart',
            'add_to_wishlist'
          )
      ) event_count,
      (
        select count(*)
        from public.wishlists wishlist
        where wishlist.product_id = product.id
      ) wishlist_count
    from public.products product
    left join public.categories category on category.id = product.category_id
    left join public.categories subcategory on subcategory.id = product.subcategory_id
    left join public.product_metrics metrics on metrics.product_id = product.id
    where product.id = target_product_id
      and product.is_active = true
  ),
  scored as (
    select
      *,
      (
        view_count * 1.0 +
        search_count * 2.0 +
        purchase_count * 14.0 +
        metric_wishlist_count * 7.0 +
        wishlist_count * 9.0 +
        event_count * 3.0 +
        rating_count * 0.4 +
        rating_stars * 4.0 +
        case when is_featured then 35 else 0 end
      )::numeric(12, 4) engagement_score,
      (
        sale_price_minor is not null
        and sale_price_minor > 0
        and sale_price_minor < price_minor
        and (sale_ends_at is null or sale_ends_at >= timezone('utc'::text, now()))
      ) has_active_sale
    from base
  ),
  candidates as (
    select 'hero-featured' slug, product_id, engagement_score + 80 score, 1 sort_order, 'seller_featured' rule
    from scored
    where is_featured

    union all
    select 'trending-products', product_id, engagement_score, 100, 'engagement_signals'
    from scored
    where engagement_score > 0

    union all
    select 'best-sellers', product_id, purchase_count * 20 + rating_count + rating_stars * 5, 100, 'purchase_and_rating_signals'
    from scored
    where purchase_count > 0 or rating_count >= 10

    union all
    select 'new-arrivals', product_id, 1000 - extract(epoch from (timezone('utc'::text, now()) - created_at)) / 86400, 100, 'recent_product'
    from scored
    where created_at >= timezone('utc'::text, now()) - interval '45 days'

    union all
    select 'flash-deals', product_id, engagement_score + 40, 100, 'active_sale_or_deal_keyword'
    from scored
    where has_active_sale or keywords && array['sale', 'deal', 'flash', 'discount', 'promo']::text[]

    union all
    select 'recommended-for-user', product_id, engagement_score + rating_stars * 4, 100, 'default_quality_pool'
    from scored
    where engagement_score > 0 or rating_count > 0 or category_id is not null

    union all
    select 'continue-shopping', product_id, engagement_score, 100, 'view_or_event_history_pool'
    from scored
    where event_count > 0 or view_count > 0

    union all
    select 'editorial-collections', product_id, engagement_score + case when is_featured then 40 else 0 end, 100, 'featured_or_high_rating'
    from scored
    where is_featured or rating_stars >= 4

    union all
    select 'hot-right-now', product_id, engagement_score + case when created_at >= timezone('utc'::text, now()) - interval '14 days' then 25 else 0 end, 100, 'recent_engagement'
    from scored
    where engagement_score > 0

    union all
    select 'most-loved', product_id, wishlist_count * 15 + metric_wishlist_count * 10 + rating_count + rating_stars * 6, 100, 'wishlist_and_rating_signals'
    from scored
    where wishlist_count > 0 or metric_wishlist_count > 0 or rating_count >= 5

    union all
    select 'editors-picks', product_id, engagement_score + 35, 100, 'featured_or_excellent_rating'
    from scored
    where is_featured or rating_stars >= 4.5

    union all
    select 'deal-of-the-day', product_id, engagement_score + case when has_active_sale then 60 else 30 end, 1, 'strongest_deal_candidate'
    from scored
    where has_active_sale or keywords && array['deal', 'flash', 'sale']::text[]

    union all
    select 'product-scroll-strip', product_id, engagement_score, 100, 'general_discovery_pool'
    from scored

    union all
    select 'bento-products', product_id, engagement_score + case when is_featured then 20 else 0 end, 100, 'showcase_layout_pool'
    from scored
    where is_featured or category_id is not null

    union all
    select 'filter-grid', product_id, engagement_score, 100, 'browsable_grid_pool'
    from scored

    union all
    select 'lookbook-products', product_id, engagement_score + case when category_slug in ('fashion-apparel', 'sneakers-footwear', 'luxury', 'watches-jewelry') then 30 else 0 end, 100, 'style_taxonomy_or_quality'
    from scored
    where is_featured
      or rating_stars >= 4
      or category_slug in ('fashion-apparel', 'sneakers-footwear', 'luxury', 'watches-jewelry')

    union all
    select 'based-on-browsing', product_id, engagement_score, 100, 'default_browsing_affinity_pool'
    from scored
    where engagement_score > 0 or rating_count > 0 or category_id is not null
  )
  insert into public.curation_products (
    curation_id,
    product_id,
    sort_order,
    score,
    source,
    metadata
  )
  select
    insertable_curation_product.curation_id,
    insertable_curation_product.product_id,
    insertable_curation_product.sort_order,
    insertable_curation_product.score,
    'taxonomy_auto',
    insertable_curation_product.metadata
  from (
    select distinct on (curation.id, candidate.product_id)
      curation.id curation_id,
      candidate.product_id,
      candidate.sort_order,
      candidate.score,
      jsonb_build_object(
        'rule', candidate.rule,
        'category_id', scored.category_id,
        'subcategory_id', scored.subcategory_id,
        'category_slug', scored.category_slug,
        'subcategory_slug', scored.subcategory_slug,
        'deterministic', true
      ) metadata
    from candidates candidate
    join scored on scored.product_id = candidate.product_id
    join public.curations curation on curation.slug = candidate.slug and curation.is_active = true
    order by curation.id, candidate.product_id, candidate.score desc, candidate.sort_order asc
  ) insertable_curation_product
  where not exists (
    select 1
    from public.curation_products existing
    where existing.curation_id = insertable_curation_product.curation_id
      and existing.product_id = insertable_curation_product.product_id
  );
end;
$$;

create or replace function public.refresh_catalog_taxonomy(p_product_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  refreshed_count integer := 0;
begin
  for refreshed_count in
    select count(*)
    from public.products product
    where p_product_id is null or product.id = p_product_id
  loop
    exit;
  end loop;

  with category_matches as (
    select
      product.id product_id,
      matched_category.id category_id,
      row_number() over (
        partition by product.id
        order by
          matched_category.taxonomy_level desc,
          length(matched_category.name) desc,
          matched_category.sort_order asc,
          matched_category.slug asc
      ) match_rank
    from public.products product
    join public.categories matched_category
      on matched_category.parent_id is not null
      and matched_category.is_active = true
      and (
        lower(product.name) like '%' || lower(matched_category.name) || '%'
        or lower(coalesce(product.brand, '')) like '%' || lower(matched_category.name) || '%'
        or exists (
          select 1
          from unnest(coalesce(product.keywords, '{}'::text[])) keyword
          where lower(keyword) = lower(matched_category.name)
        )
      )
    where product.subcategory_id is null
      and (p_product_id is null or product.id = p_product_id)
  )
  update public.products product
  set
    subcategory_id = category_matches.category_id,
    category_id = coalesce(product.category_id, public.category_root_id(category_matches.category_id))
  from category_matches
  where product.id = category_matches.product_id
    and category_matches.match_rank = 1;

  perform public.refresh_product_curations(product.id)
  from public.products product
  where p_product_id is null or product.id = p_product_id;

  return jsonb_build_object(
    'success', true,
    'processedProducts', refreshed_count,
    'mode', case when p_product_id is null then 'all' else 'single' end,
    'accuracy', 'seller_selected_category_and_subcategory_first_deterministic_text_repair_only'
  );
end;
$$;

revoke all on function public.get_category_products(text, text, integer, integer) from public;
grant execute on function public.get_category_products(text, text, integer, integer) to anon, authenticated, service_role;

revoke all on function public.refresh_catalog_taxonomy(uuid) from public;
grant execute on function public.refresh_catalog_taxonomy(uuid) to service_role;

commit;
