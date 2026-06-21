/* ============================================================
   HOLOS — Taxonomy Engine
   Category → Subcategory → Field Schema
   This is the heart of the marketplace. Each subcategory
   defines its own fields. Add-product forms and product
   pages both read from these schemas.
   ============================================================ */

const Taxonomy = (() => {

  /* ---- FIELD TYPES ----
     text       : single line
     textarea   : multi line
     number     : numeric + unit
     select     : pick one
     multiselect: pick many (chips)
     colors     : color swatches (multi)
     sizes      : size pills (multi)
     boolean    : yes/no toggle
  */

  /* Reusable option sets */
  const SIZES_CLOTHING = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const SIZES_UK_SHOE = ['UK 5','UK 6','UK 7','UK 8','UK 9','UK 10','UK 11','UK 12'];
  const SIZES_KIDS = ['2-3y','4-5y','6-7y','8-9y','10-11y','12-13y'];
  const GENDERS = ['Men', 'Women', 'Unisex', 'Boys', 'Girls'];

  /* ============================================================
     THE TAXONOMY TREE
     ============================================================ */
  const TREE = {
    fashion: {
      id: 'fashion', label: 'Fashion', icon: 'cat_fashion',
      subcategories: {
        'mens-shoes': {
          id: 'mens-shoes', label: "Men's Shoes", tryOn: 'foot',
          fields: [
            { key: 'gender', label: 'Gender', type: 'select', options: ['Men','Unisex'], required: true },
            { key: 'sizes', label: 'Available sizes', type: 'sizes', options: SIZES_UK_SHOE, required: true },
            { key: 'colors', label: 'Colors', type: 'colors', required: true },
            { key: 'material', label: 'Material', type: 'select', options: ['Leather','Suede','Canvas','Synthetic','Mesh'], required: true },
            { key: 'style', label: 'Style', type: 'select', options: ['Sneaker','Oxford','Loafer','Boot','Sandal','Formal'] },
            { key: 'sole', label: 'Sole type', type: 'select', options: ['Rubber','Leather','EVA','TPU'] },
          ],
        },
        'womens-shoes': {
          id: 'womens-shoes', label: "Women's Shoes", tryOn: 'foot',
          fields: [
            { key: 'gender', label: 'Gender', type: 'select', options: ['Women','Unisex'], required: true },
            { key: 'sizes', label: 'Available sizes', type: 'sizes', options: SIZES_UK_SHOE, required: true },
            { key: 'colors', label: 'Colors', type: 'colors', required: true },
            { key: 'heelHeight', label: 'Heel height', type: 'select', options: ['Flat','Low (2-4cm)','Mid (5-7cm)','High (8cm+)'] },
            { key: 'material', label: 'Material', type: 'select', options: ['Leather','Suede','Canvas','Synthetic'], required: true },
            { key: 'style', label: 'Style', type: 'select', options: ['Heels','Flats','Sneaker','Sandal','Boot','Wedge'] },
          ],
        },
        'mens-clothing': {
          id: 'mens-clothing', label: "Men's Clothing", tryOn: 'body-ai',
          fields: [
            { key: 'sizes', label: 'Available sizes', type: 'sizes', options: SIZES_CLOTHING, required: true },
            { key: 'colors', label: 'Colors', type: 'colors', required: true },
            { key: 'garmentType', label: 'Type', type: 'select', options: ['Shirt','T-Shirt','Kurta','Trousers','Jeans','Jacket','Suit'], required: true },
            { key: 'fabric', label: 'Fabric', type: 'select', options: ['Cotton','Linen','Polyester','Wool','Silk','Denim','Blend'], required: true },
            { key: 'fit', label: 'Fit', type: 'select', options: ['Slim','Regular','Relaxed','Oversized'] },
            { key: 'sleeve', label: 'Sleeve', type: 'select', options: ['Full','Half','Sleeveless'] },
            { key: 'occasion', label: 'Occasion', type: 'multiselect', options: ['Casual','Formal','Party','Wedding','Office'] },
          ],
        },
        'womens-clothing': {
          id: 'womens-clothing', label: "Women's Clothing", tryOn: 'body-ai',
          fields: [
            { key: 'sizes', label: 'Available sizes', type: 'sizes', options: SIZES_CLOTHING, required: true },
            { key: 'colors', label: 'Colors', type: 'colors', required: true },
            { key: 'garmentType', label: 'Type', type: 'select', options: ['Kurta','Lehenga','Saree','Dress','Top','Trousers','Abaya','Gown'], required: true },
            { key: 'fabric', label: 'Fabric', type: 'select', options: ['Cotton','Silk','Chiffon','Lawn','Georgette','Velvet','Linen'], required: true },
            { key: 'work', label: 'Embellishment', type: 'multiselect', options: ['Plain','Embroidered','Printed','Sequins','Gota','Mirror work'] },
            { key: 'occasion', label: 'Occasion', type: 'multiselect', options: ['Casual','Formal','Party','Bridal','Festive','Office'] },
          ],
        },
        'kids-clothing': {
          id: 'kids-clothing', label: "Kids' Clothing", tryOn: 'body-ai',
          fields: [
            { key: 'ageGroup', label: 'Age group', type: 'sizes', options: SIZES_KIDS, required: true },
            { key: 'gender', label: 'Gender', type: 'select', options: ['Boys','Girls','Unisex'], required: true },
            { key: 'colors', label: 'Colors', type: 'colors', required: true },
            { key: 'garmentType', label: 'Type', type: 'select', options: ['Shirt','Frock','Trousers','Suit','Sleepwear'], required: true },
            { key: 'fabric', label: 'Fabric', type: 'select', options: ['Cotton','Fleece','Polyester','Blend'] },
          ],
        },
        'bags': {
          id: 'bags', label: 'Bags', tryOn: 'room',
          fields: [
            { key: 'bagType', label: 'Type', type: 'select', options: ['Tote','Backpack','Clutch','Briefcase','Crossbody','Handbag','Wallet'], required: true },
            { key: 'colors', label: 'Colors', type: 'colors', required: true },
            { key: 'material', label: 'Material', type: 'select', options: ['Leather','Faux Leather','Canvas','Nylon','Suede'], required: true },
            { key: 'gender', label: 'For', type: 'select', options: GENDERS },
            { key: 'compartments', label: 'Compartments', type: 'number', unit: 'count' },
          ],
        },
      },
    },

    accessories: {
      id: 'accessories', label: 'Accessories', icon: 'cat_accessories',
      subcategories: {
        'watches': {
          id: 'watches', label: 'Watches', tryOn: 'wrist',
          fields: [
            { key: 'gender', label: 'For', type: 'select', options: GENDERS, required: true },
            { key: 'colors', label: 'Strap colors', type: 'colors', required: true },
            { key: 'caseSize', label: 'Case size', type: 'select', options: ['36mm','38mm','40mm','42mm','44mm','46mm'], required: true },
            { key: 'movement', label: 'Movement', type: 'select', options: ['Automatic','Quartz','Mechanical','Smart'], required: true },
            { key: 'strap', label: 'Strap material', type: 'select', options: ['Leather','Steel','Silicone','Fabric'] },
            { key: 'waterResist', label: 'Water resistance', type: 'select', options: ['None','30m','50m','100m','200m'] },
          ],
        },
        'eyewear': {
          id: 'eyewear', label: 'Eyewear', tryOn: 'face',
          fields: [
            { key: 'gender', label: 'For', type: 'select', options: GENDERS, required: true },
            { key: 'colors', label: 'Frame colors', type: 'colors', required: true },
            { key: 'frameShape', label: 'Frame shape', type: 'select', options: ['Aviator','Round','Square','Cat-eye','Rectangle','Wayfarer'], required: true },
            { key: 'lensType', label: 'Lens', type: 'select', options: ['Sunglasses','Prescription-ready','Blue-light','Polarized'], required: true },
            { key: 'frameMaterial', label: 'Frame material', type: 'select', options: ['Metal','Acetate','TR90','Titanium'] },
          ],
        },
        'jewelry': {
          id: 'jewelry', label: 'Jewelry', tryOn: 'finger',
          fields: [
            { key: 'jewelryType', label: 'Type', type: 'select', options: ['Ring','Necklace','Earrings','Bracelet','Bangle','Pendant'], required: true },
            { key: 'colors', label: 'Metal tone', type: 'colors', required: true },
            { key: 'metal', label: 'Metal', type: 'select', options: ['Gold','Silver','Platinum','Rose Gold','Artificial'], required: true },
            { key: 'stone', label: 'Stone', type: 'select', options: ['None','Diamond','Cubic Zirconia','Pearl','Ruby','Emerald'] },
            { key: 'sizes', label: 'Ring sizes (if ring)', type: 'multiselect', options: ['Adjustable','6','7','8','9','10','11','12'] },
          ],
        },
      },
    },

    electronics: {
      id: 'electronics', label: 'Electronics', icon: 'cat_electronics',
      subcategories: {
        'laptops': {
          id: 'laptops', label: 'Laptops', tryOn: 'room',
          fields: [
            { key: 'brand', label: 'Brand', type: 'text', required: true },
            { key: 'processor', label: 'Processor', type: 'select', options: ['Intel i3','Intel i5','Intel i7','Intel i9','AMD Ryzen 5','AMD Ryzen 7','Apple M2','Apple M3'], required: true },
            { key: 'ram', label: 'RAM', type: 'select', options: ['8GB','16GB','32GB','64GB'], required: true },
            { key: 'storage', label: 'Storage', type: 'select', options: ['256GB SSD','512GB SSD','1TB SSD','2TB SSD'], required: true },
            { key: 'screenSize', label: 'Screen', type: 'select', options: ['13"','14"','15.6"','16"','17"'], required: true },
            { key: 'colors', label: 'Colors', type: 'colors' },
            { key: 'warranty', label: 'Warranty', type: 'select', options: ['No warranty','6 months','1 year','2 years'] },
          ],
        },
        'phones': {
          id: 'phones', label: 'Phones', tryOn: 'room',
          fields: [
            { key: 'brand', label: 'Brand', type: 'text', required: true },
            { key: 'storage', label: 'Storage', type: 'select', options: ['64GB','128GB','256GB','512GB','1TB'], required: true },
            { key: 'ram', label: 'RAM', type: 'select', options: ['4GB','6GB','8GB','12GB','16GB'], required: true },
            { key: 'colors', label: 'Colors', type: 'colors', required: true },
            { key: 'screenSize', label: 'Screen', type: 'number', unit: 'inches' },
            { key: 'condition', label: 'Condition', type: 'select', options: ['New','Open box','Refurbished'], required: true },
            { key: 'warranty', label: 'Warranty', type: 'select', options: ['No warranty','6 months','1 year'] },
          ],
        },
        'audio': {
          id: 'audio', label: 'Audio', tryOn: 'room',
          fields: [
            { key: 'audioType', label: 'Type', type: 'select', options: ['Headphones','Earbuds','Speaker','Soundbar'], required: true },
            { key: 'colors', label: 'Colors', type: 'colors', required: true },
            { key: 'connectivity', label: 'Connectivity', type: 'multiselect', options: ['Bluetooth','Wired','USB-C','AUX'], required: true },
            { key: 'battery', label: 'Battery life', type: 'number', unit: 'hours' },
            { key: 'anc', label: 'Noise cancellation', type: 'boolean' },
          ],
        },
        'televisions': {
          id: 'televisions', label: 'Televisions', tryOn: 'room',
          fields: [
            { key: 'brand', label: 'Brand', type: 'text', required: true },
            { key: 'screenSize', label: 'Screen size', type: 'select', options: ['32"','43"','50"','55"','65"','75"','85"'], required: true },
            { key: 'resolution', label: 'Resolution', type: 'select', options: ['HD','Full HD','4K UHD','8K'], required: true },
            { key: 'panel', label: 'Panel type', type: 'select', options: ['LED','QLED','OLED','Mini-LED'] },
            { key: 'smart', label: 'Smart TV', type: 'boolean' },
            { key: 'colors', label: 'Colors', type: 'colors' },
            { key: 'warranty', label: 'Warranty', type: 'select', options: ['No warranty','1 year','2 years','3 years'] },
          ],
        },
        'air-conditioners': {
          id: 'air-conditioners', label: 'Air Conditioners', tryOn: 'room',
          fields: [
            { key: 'brand', label: 'Brand', type: 'text', required: true },
            { key: 'acType', label: 'Type', type: 'select', options: ['Split','Window','Portable','Floor standing','Inverter'], required: true },
            { key: 'capacity', label: 'Capacity (tons)', type: 'select', options: ['0.75','1.0','1.5','2.0','2.5'], required: true },
            { key: 'energyRating', label: 'Energy rating', type: 'select', options: ['1 star','2 star','3 star','4 star','5 star'] },
            { key: 'inverter', label: 'Inverter technology', type: 'boolean' },
            { key: 'warranty', label: 'Warranty', type: 'select', options: ['1 year','2 years','5 years','10 years (compressor)'] },
          ],
        },
        'refrigerators': {
          id: 'refrigerators', label: 'Refrigerators', tryOn: 'room',
          fields: [
            { key: 'brand', label: 'Brand', type: 'text', required: true },
            { key: 'fridgeType', label: 'Type', type: 'select', options: ['Single door','Double door','Side-by-side','French door','Mini fridge'], required: true },
            { key: 'capacity', label: 'Capacity (litres)', type: 'number', unit: 'L', required: true },
            { key: 'colors', label: 'Colors', type: 'colors', required: true },
            { key: 'inverter', label: 'Inverter compressor', type: 'boolean' },
            { key: 'energyRating', label: 'Energy rating', type: 'select', options: ['2 star','3 star','4 star','5 star'] },
            { key: 'warranty', label: 'Warranty', type: 'select', options: ['1 year','2 years','10 years (compressor)'] },
          ],
        },
        'washing-machines': {
          id: 'washing-machines', label: 'Washing Machines', tryOn: 'room',
          fields: [
            { key: 'brand', label: 'Brand', type: 'text', required: true },
            { key: 'machineType', label: 'Type', type: 'select', options: ['Top load','Front load','Semi-automatic','Twin tub'], required: true },
            { key: 'capacity', label: 'Capacity (kg)', type: 'select', options: ['6 kg','7 kg','8 kg','9 kg','10 kg','12 kg'], required: true },
            { key: 'colors', label: 'Colors', type: 'colors' },
            { key: 'inverter', label: 'Inverter motor', type: 'boolean' },
            { key: 'warranty', label: 'Warranty', type: 'select', options: ['1 year','2 years','5 years','10 years (motor)'] },
          ],
        },
      },
    },

    home: {
      id: 'home', label: 'Home & Decor', icon: 'cat_home',
      subcategories: {
        'furniture': {
          id: 'furniture', label: 'Furniture', tryOn: 'room',
          fields: [
            { key: 'furnitureType', label: 'Type', type: 'select', options: ['Chair','Sofa','Table','Bed','Shelf','Cabinet','Desk'], required: true },
            { key: 'colors', label: 'Colors', type: 'colors', required: true },
            { key: 'material', label: 'Material', type: 'select', options: ['Solid wood','Engineered wood','Metal','Rattan','Upholstered'], required: true },
            { key: 'dimensions', label: 'Dimensions (W×D×H cm)', type: 'text', required: true },
            { key: 'assembly', label: 'Assembly required', type: 'boolean' },
          ],
        },
        'carpets': {
          id: 'carpets', label: 'Carpets & Rugs', tryOn: 'room',
          fields: [
            { key: 'dimensions', label: 'Dimensions (cm)', type: 'text', required: true },
            { key: 'colors', label: 'Colors', type: 'colors', required: true },
            { key: 'material', label: 'Material', type: 'select', options: ['Wool','Silk','Cotton','Jute','Synthetic','Blend'], required: true },
            { key: 'pileHeight', label: 'Pile height', type: 'select', options: ['Low','Medium','High','Shag'] },
            { key: 'shape', label: 'Shape', type: 'select', options: ['Rectangle','Round','Runner','Square','Oval'], required: true },
            { key: 'weave', label: 'Weave', type: 'select', options: ['Hand-knotted','Hand-tufted','Machine-made','Flatweave'] },
            { key: 'origin', label: 'Origin', type: 'text' },
          ],
        },
        'lighting': {
          id: 'lighting', label: 'Lighting', tryOn: 'room',
          fields: [
            { key: 'lightType', label: 'Type', type: 'select', options: ['Pendant','Table lamp','Floor lamp','Chandelier','Wall sconce'], required: true },
            { key: 'colors', label: 'Colors', type: 'colors', required: true },
            { key: 'material', label: 'Material', type: 'select', options: ['Brass','Glass','Steel','Wood','Fabric shade'] },
            { key: 'bulbType', label: 'Bulb', type: 'select', options: ['E27','E14','LED integrated','GU10'] },
            { key: 'dimmable', label: 'Dimmable', type: 'boolean' },
          ],
        },
        'wall-decor': {
          id: 'wall-decor', label: 'Wall Decor', tryOn: 'wall',
          fields: [
            { key: 'decorType', label: 'Type', type: 'select', options: ['Framed print','Canvas','Mirror','Clock','Tapestry'], required: true },
            { key: 'dimensions', label: 'Dimensions (cm)', type: 'text', required: true },
            { key: 'colors', label: 'Colors', type: 'colors' },
            { key: 'frameMaterial', label: 'Frame', type: 'select', options: ['Wood','Metal','Frameless','Plastic'] },
            { key: 'orientation', label: 'Orientation', type: 'select', options: ['Portrait','Landscape','Square'] },
          ],
        },
      },
    },

    kitchen: {
      id: 'kitchen', label: 'Kitchen', icon: 'cat_kitchen',
      subcategories: {
        'cookware': {
          id: 'cookware', label: 'Cookware', tryOn: 'room',
          fields: [
            { key: 'cookwareType', label: 'Type', type: 'select', options: ['Pot','Pan','Pressure cooker','Wok','Baking set','Knife set'], required: true },
            { key: 'material', label: 'Material', type: 'select', options: ['Stainless steel','Non-stick','Cast iron','Ceramic','Aluminium'], required: true },
            { key: 'colors', label: 'Colors', type: 'colors' },
            { key: 'pieces', label: 'Pieces in set', type: 'number', unit: 'pcs' },
            { key: 'inductionReady', label: 'Induction-ready', type: 'boolean' },
          ],
        },
        'appliances': {
          id: 'appliances', label: 'Appliances', tryOn: 'room',
          fields: [
            { key: 'applianceType', label: 'Type', type: 'select', options: ['Blender','Microwave','Air fryer','Kettle','Toaster','Coffee maker'], required: true },
            { key: 'brand', label: 'Brand', type: 'text', required: true },
            { key: 'colors', label: 'Colors', type: 'colors' },
            { key: 'power', label: 'Power', type: 'number', unit: 'watts' },
            { key: 'capacity', label: 'Capacity', type: 'text' },
            { key: 'warranty', label: 'Warranty', type: 'select', options: ['6 months','1 year','2 years'] },
          ],
        },
        'tableware': {
          id: 'tableware', label: 'Tableware', tryOn: 'room',
          fields: [
            { key: 'tablewareType', label: 'Type', type: 'select', options: ['Dinner set','Cups & mugs','Glassware','Cutlery','Serving dishes'], required: true },
            { key: 'material', label: 'Material', type: 'select', options: ['Ceramic','Porcelain','Glass','Melamine','Bone china'], required: true },
            { key: 'colors', label: 'Colors', type: 'colors' },
            { key: 'pieces', label: 'Pieces', type: 'number', unit: 'pcs' },
          ],
        },
      },
    },

    beauty: {
      id: 'beauty', label: 'Beauty', icon: 'cat_beauty',
      subcategories: {
        'makeup': {
          id: 'makeup', label: 'Makeup', tryOn: 'face',
          fields: [
            { key: 'makeupType', label: 'Type', type: 'select', options: ['Lipstick','Foundation','Eyeshadow','Mascara','Blush','Concealer'], required: true },
            { key: 'shades', label: 'Available shades', type: 'colors', required: true },
            { key: 'finish', label: 'Finish', type: 'select', options: ['Matte','Glossy','Satin','Shimmer'] },
            { key: 'skinType', label: 'Skin type', type: 'multiselect', options: ['All','Oily','Dry','Combination','Sensitive'] },
            { key: 'volume', label: 'Volume/Weight', type: 'text' },
          ],
        },
        'fragrance': {
          id: 'fragrance', label: 'Fragrance', tryOn: null,
          fields: [
            { key: 'gender', label: 'For', type: 'select', options: GENDERS, required: true },
            { key: 'scentFamily', label: 'Scent family', type: 'select', options: ['Floral','Woody','Oriental','Fresh','Citrus','Musky'], required: true },
            { key: 'volume', label: 'Volume', type: 'select', options: ['30ml','50ml','75ml','100ml','200ml'], required: true },
            { key: 'concentration', label: 'Type', type: 'select', options: ['Eau de Parfum','Eau de Toilette','Attar','Body mist'] },
          ],
        },
        'skincare': {
          id: 'skincare', label: 'Skincare', tryOn: null,
          fields: [
            { key: 'skincareType', label: 'Type', type: 'select', options: ['Cleanser','Moisturizer','Serum','Sunscreen','Mask','Toner'], required: true },
            { key: 'skinType', label: 'Skin type', type: 'multiselect', options: ['All','Oily','Dry','Combination','Sensitive','Acne-prone'], required: true },
            { key: 'volume', label: 'Volume', type: 'text', required: true },
            { key: 'concern', label: 'Targets', type: 'multiselect', options: ['Acne','Aging','Brightening','Hydration','Pigmentation'] },
          ],
        },
      },
    },

    grocery: {
      id: 'grocery', label: 'Grocery & Food', icon: 'cat_grocery',
      subcategories: {
        'packaged-food': {
          id: 'packaged-food', label: 'Packaged Food', tryOn: null,
          fields: [
            { key: 'foodType', label: 'Type', type: 'select', options: ['Snacks','Beverages','Spices','Rice & Grains','Oil & Ghee','Sweets'], required: true },
            { key: 'weight', label: 'Weight/Volume', type: 'text', required: true },
            { key: 'dietary', label: 'Dietary', type: 'multiselect', options: ['Halal','Vegetarian','Vegan','Gluten-free','Sugar-free'] },
            { key: 'expiry', label: 'Shelf life', type: 'text' },
            { key: 'ingredients', label: 'Ingredients', type: 'textarea' },
          ],
        },
        'fresh-produce': {
          id: 'fresh-produce', label: 'Fresh Produce', tryOn: null,
          fields: [
            { key: 'produceType', label: 'Type', type: 'select', options: ['Fruits','Vegetables','Meat','Dairy','Bakery'], required: true },
            { key: 'weight', label: 'Sold per', type: 'select', options: ['Per kg','Per piece','Per dozen','Per bundle'], required: true },
            { key: 'organic', label: 'Organic', type: 'boolean' },
            { key: 'origin', label: 'Origin', type: 'text' },
          ],
        },
      },
    },

    toys: {
      id: 'toys', label: 'Toys & Gifts', icon: 'cat_toys',
      subcategories: {
        'toys-games': {
          id: 'toys-games', label: 'Toys & Games', tryOn: 'room',
          fields: [
            { key: 'toyType', label: 'Type', type: 'select', options: ['Soft toy','Building blocks','Board game','Action figure','Educational','Remote control'], required: true },
            { key: 'ageRange', label: 'Age range', type: 'select', options: ['0-2y','3-5y','6-8y','9-12y','12y+'], required: true },
            { key: 'colors', label: 'Colors', type: 'colors' },
            { key: 'material', label: 'Material', type: 'select', options: ['Plastic','Wood','Plush','Metal'] },
            { key: 'batteries', label: 'Batteries required', type: 'boolean' },
          ],
        },
        'gift-cards': {
          id: 'gift-cards', label: 'Gift Cards', tryOn: null,
          fields: [
            { key: 'denomination', label: 'Value options', type: 'multiselect', options: ['Rs.500','Rs.1000','Rs.2500','Rs.5000','Rs.10000'], required: true },
            { key: 'delivery', label: 'Delivery', type: 'select', options: ['Digital (email)','Physical card'], required: true },
            { key: 'validity', label: 'Validity', type: 'select', options: ['6 months','1 year','No expiry'] },
          ],
        },
      },
    },

    sports: {
      id: 'sports', label: 'Sports & Outdoors', icon: 'cat_sports',
      subcategories: {
        'fitness-equipment': {
          id: 'fitness-equipment', label: 'Fitness Equipment', tryOn: 'room',
          fields: [
            { key: 'equipType', label: 'Type', type: 'select', options: ['Treadmill','Dumbbells','Exercise bike','Yoga mat','Bench','Resistance bands'], required: true },
            { key: 'colors', label: 'Colors', type: 'colors' },
            { key: 'maxWeight', label: 'Max user weight', type: 'number', unit: 'kg' },
            { key: 'foldable', label: 'Foldable', type: 'boolean' },
          ],
        },
        'sportswear': {
          id: 'sportswear', label: 'Sportswear', tryOn: 'body-ai',
          fields: [
            { key: 'sizes', label: 'Sizes', type: 'sizes', options: ['XS','S','M','L','XL','XXL'], required: true },
            { key: 'colors', label: 'Colors', type: 'colors', required: true },
            { key: 'gender', label: 'For', type: 'select', options: ['Men','Women','Unisex','Kids'], required: true },
            { key: 'sport', label: 'Sport', type: 'multiselect', options: ['Running','Gym','Football','Cricket','Yoga','Cycling'] },
          ],
        },
        'outdoor-gear': {
          id: 'outdoor-gear', label: 'Outdoor & Camping', tryOn: 'room',
          fields: [
            { key: 'gearType', label: 'Type', type: 'select', options: ['Tent','Sleeping bag','Backpack','Cooler','Camping stove'], required: true },
            { key: 'colors', label: 'Colors', type: 'colors' },
            { key: 'capacity', label: 'Capacity', type: 'text' },
          ],
        },
      },
    },

    health: {
      id: 'health', label: 'Health & Personal Care', icon: 'cat_health',
      subcategories: {
        'supplements': {
          id: 'supplements', label: 'Supplements & Vitamins', tryOn: null,
          fields: [
            { key: 'suppType', label: 'Type', type: 'select', options: ['Protein','Vitamins','Minerals','Pre-workout','Omega'], required: true },
            { key: 'quantity', label: 'Quantity', type: 'text', required: true },
            { key: 'flavor', label: 'Flavor', type: 'text' },
            { key: 'dietary', label: 'Dietary', type: 'multiselect', options: ['Halal','Vegan','Gluten-free','Sugar-free'] },
          ],
        },
        'medical-devices': {
          id: 'medical-devices', label: 'Medical Devices', tryOn: null,
          fields: [
            { key: 'deviceType', label: 'Type', type: 'select', options: ['BP monitor','Thermometer','Glucometer','Pulse oximeter','Nebulizer','Weighing scale'], required: true },
            { key: 'brand', label: 'Brand', type: 'text', required: true },
            { key: 'warranty', label: 'Warranty', type: 'select', options: ['6 months','1 year','2 years'] },
          ],
        },
        'personal-care': {
          id: 'personal-care', label: 'Personal Care', tryOn: null,
          fields: [
            { key: 'careType', label: 'Type', type: 'select', options: ['Hair dryer','Trimmer','Shaver','Straightener','Electric toothbrush'], required: true },
            { key: 'brand', label: 'Brand', type: 'text' },
            { key: 'colors', label: 'Colors', type: 'colors' },
          ],
        },
      },
    },

    automotive: {
      id: 'automotive', label: 'Automotive', icon: 'cat_automotive',
      subcategories: {
        'car-accessories': {
          id: 'car-accessories', label: 'Car Accessories', tryOn: 'room',
          fields: [
            { key: 'accType', label: 'Type', type: 'select', options: ['Seat cover','Floor mat','Dashboard cam','Phone mount','Air freshener','Cover'], required: true },
            { key: 'colors', label: 'Colors', type: 'colors' },
            { key: 'compatibility', label: 'Compatible models', type: 'text' },
          ],
        },
        'car-electronics': {
          id: 'car-electronics', label: 'Car Electronics', tryOn: 'room',
          fields: [
            { key: 'elecType', label: 'Type', type: 'select', options: ['Stereo','Speakers','Dash cam','GPS','Reverse camera'], required: true },
            { key: 'brand', label: 'Brand', type: 'text', required: true },
            { key: 'warranty', label: 'Warranty', type: 'select', options: ['6 months','1 year'] },
          ],
        },
        'bike-accessories': {
          id: 'bike-accessories', label: 'Motorbike Accessories', tryOn: 'room',
          fields: [
            { key: 'bikeAccType', label: 'Type', type: 'select', options: ['Helmet','Gloves','Cover','Lock','Saddlebag'], required: true },
            { key: 'colors', label: 'Colors', type: 'colors' },
            { key: 'sizes', label: 'Sizes', type: 'multiselect', options: ['S','M','L','XL'] },
          ],
        },
      },
    },

    books: {
      id: 'books', label: 'Books & Stationery', icon: 'cat_books',
      subcategories: {
        'books-cat': {
          id: 'books-cat', label: 'Books', tryOn: null,
          fields: [
            { key: 'genre', label: 'Genre', type: 'select', options: ['Fiction','Non-fiction','Religious','Children','Academic','Self-help','Comics'], required: true },
            { key: 'language', label: 'Language', type: 'select', options: ['English','Urdu','Arabic','Other'], required: true },
            { key: 'author', label: 'Author', type: 'text' },
            { key: 'format', label: 'Format', type: 'select', options: ['Paperback','Hardcover','Used'] },
          ],
        },
        'stationery': {
          id: 'stationery', label: 'Stationery', tryOn: null,
          fields: [
            { key: 'statType', label: 'Type', type: 'select', options: ['Notebooks','Pens','Art supplies','Office supplies','School set'], required: true },
            { key: 'colors', label: 'Colors', type: 'colors' },
            { key: 'pieces', label: 'Pieces', type: 'number', unit: 'pcs' },
          ],
        },
      },
    },

    baby: {
      id: 'baby', label: 'Baby & Kids', icon: 'cat_baby',
      subcategories: {
        'baby-gear': {
          id: 'baby-gear', label: 'Baby Gear', tryOn: 'room',
          fields: [
            { key: 'gearType', label: 'Type', type: 'select', options: ['Stroller','Car seat','Carrier','High chair','Cot','Walker'], required: true },
            { key: 'colors', label: 'Colors', type: 'colors', required: true },
            { key: 'ageRange', label: 'Age range', type: 'select', options: ['0-6m','6-12m','1-2y','2-4y'] },
          ],
        },
        'diapers-care': {
          id: 'diapers-care', label: 'Diapers & Care', tryOn: null,
          fields: [
            { key: 'careType', label: 'Type', type: 'select', options: ['Diapers','Wipes','Lotion','Shampoo','Feeding bottle'], required: true },
            { key: 'size', label: 'Size', type: 'select', options: ['Newborn','Small','Medium','Large','XL'] },
            { key: 'quantity', label: 'Quantity', type: 'text' },
          ],
        },
        'toys-infant': {
          id: 'toys-infant', label: 'Infant Toys', tryOn: 'room',
          fields: [
            { key: 'toyType', label: 'Type', type: 'select', options: ['Rattle','Soft toy','Teether','Activity gym','Musical'], required: true },
            { key: 'colors', label: 'Colors', type: 'colors' },
            { key: 'ageRange', label: 'Age range', type: 'select', options: ['0-6m','6-12m','1-2y'] },
          ],
        },
      },
    },

    pets: {
      id: 'pets', label: 'Pet Supplies', icon: 'cat_pets',
      subcategories: {
        'pet-food': {
          id: 'pet-food', label: 'Pet Food', tryOn: null,
          fields: [
            { key: 'petType', label: 'For', type: 'select', options: ['Dog','Cat','Bird','Fish','Other'], required: true },
            { key: 'foodType', label: 'Type', type: 'select', options: ['Dry','Wet','Treats','Supplements'], required: true },
            { key: 'weight', label: 'Weight', type: 'text', required: true },
          ],
        },
        'pet-accessories': {
          id: 'pet-accessories', label: 'Pet Accessories', tryOn: 'room',
          fields: [
            { key: 'petType', label: 'For', type: 'select', options: ['Dog','Cat','Bird','Fish','Other'], required: true },
            { key: 'accType', label: 'Type', type: 'select', options: ['Bed','Leash','Bowl','Toy','Cage','Grooming'], required: true },
            { key: 'colors', label: 'Colors', type: 'colors' },
          ],
        },
      },
    },
  };

  /* ============================================================
     API
     ============================================================ */
  /* Suggested real-world size in cm for a subcategory.
     Used as a hint when seller/admin uploads a 3D model. */
  const SIZE_HINTS = {
    // Watches & accessories
    'watches-analog':4, 'watches-digital':4, 'watches-smart':4, 'watches-luxury':4,
    'sunglasses':14, 'glasses':14, 'eyewear':14,
    'jewelry-ring':2, 'jewelry-necklace':18, 'jewelry-earring':3, 'jewelry-bracelet':18, 'jewelry-pendant':4,
    // Shoes
    'shoes-formal':30, 'shoes-sneakers':30, 'shoes-boots':32, 'shoes-sandals':28, 'shoes-loafers':30, 'shoes-heels':25,
    // Clothing (worn standing roughly 1.5m)
    'clothing-shirt':70, 'clothing-tshirt':70, 'clothing-pants':100, 'clothing-jacket':75, 'clothing-dress':120, 'clothing-suit':140,
    'bridal-lehenga':150, 'bridal-saree':550, 'bridal-gown':150,
    // Bags
    'bags-handbag':35, 'bags-backpack':45, 'bags-clutch':25, 'bags-tote':40, 'bags-wallet':12,
    // Furniture (rooms)
    'furniture-sofa':220, 'furniture-chair':90, 'furniture-armchair':90, 'furniture-table':150, 'furniture-bed':200, 'furniture-bookshelf':180, 'furniture-cabinet':120, 'furniture-desk':140,
    // Decor
    'decor-lamp':50, 'decor-vase':30, 'decor-mirror':80, 'decor-rug':200, 'decor-wallart':70, 'decor-clock':40, 'decor-cushion':45,
    // Kitchen
    'kitchen-cookware':30, 'kitchen-appliance':40, 'kitchen-utensils':25, 'kitchen-dinnerware':25,
    // Electronics
    'electronics-phone':16, 'electronics-laptop':35, 'electronics-tv':110, 'electronics-headphones':20, 'electronics-speaker':25, 'electronics-camera':15, 'electronics-tablet':25,
    // Beauty (small items)
    'beauty-makeup':10, 'beauty-skincare':10, 'beauty-perfume':10, 'beauty-haircare':18,
    // Toys
    'toys-figure':20, 'toys-plush':30, 'toys-vehicle':25, 'toys-building':30, 'toys-board':40,
    // Sports
    'sports-ball':22, 'sports-equipment':100, 'sports-apparel':70,
    // Auto
    'automotive-parts':30, 'automotive-accessories':25,
  };

  function getSuggestedSize(subId) {
    if (SIZE_HINTS[subId]) return SIZE_HINTS[subId];
    // Try to match by prefix
    const cat = getSubcategoryById(subId);
    if (cat) {
      for (const [key, val] of Object.entries(SIZE_HINTS)) {
        if (cat.categoryId && key.startsWith(cat.categoryId + '-')) return val;
      }
    }
    return null;
  }

function getCategories() {
    return Object.values(TREE);
  }
  function getCategory(catId) {
    return TREE[catId];
  }
  function getSubcategory(catId, subId) {
    return TREE[catId]?.subcategories[subId];
  }
  function getSubcategoryById(subId) {
    // search across all categories
    for (const cat of Object.values(TREE)) {
      if (cat.subcategories[subId]) {
        return { ...cat.subcategories[subId], categoryId: cat.id, categoryLabel: cat.label };
      }
    }
    return null;
  }
  function getSubcategoriesOf(catId) {
    const cat = TREE[catId];
    if (!cat || !cat.subcategories) return [];
    return Object.values(cat.subcategories);
  }
  function getAllSubcategories() {
    const list = [];
    for (const cat of Object.values(TREE)) {
      for (const sub of Object.values(cat.subcategories)) {
        list.push({ ...sub, categoryId: cat.id, categoryLabel: cat.label });
      }
    }
    return list;
  }
  function getSchema(subId) {
    const sub = getSubcategoryById(subId);
    return sub ? sub.fields : [];
  }
  /* Add a new subcategory at runtime (admin approves a request) */
  function addSubcategory(catId, subDef) {
    if (!TREE[catId]) return false;
    TREE[catId].subcategories[subDef.id] = subDef;
    log('Taxonomy', `added subcategory ${subDef.id} under ${catId}`);
    return true;
  }
  /* Add a whole new category */
  function addCategory(catDef) {
    TREE[catDef.id] = { ...catDef, subcategories: catDef.subcategories || {} };
    log('Taxonomy', `added category ${catDef.id}`);
    return true;
  }

  return {
    TREE,
    getCategories, getCategory, getSubcategory, getSubcategoryById,
    getSubcategoriesOf, getAllSubcategories, getSchema,
    addSubcategory, addCategory, getSuggestedSize,
  };
})();

window.Taxonomy = Taxonomy;
