import { db } from "../server/db";
import { users, profile, events, stalls, products } from "../shared/schema";
import { hashPassword } from "../server/auth";
import { eq, and } from "drizzle-orm";

/**
 * Sri Lanka Book Fair — demo seed data
 * -------------------------------------
 * Idempotent: safe to run multiple times, won't duplicate rows.
 * All demo accounts share the password: Demo@12345
 * Run with: npx tsx seed/seed-bookfair-demo-v2.ts
 */

async function getOrCreateUser(data: {
  username: string;
  email: string;
  role: "admin" | "vendor" | "customer" | "organizer";
  passwordHash: string;
}) {
  const existing = await db.query.users.findFirst({
    where: eq(users.username, data.username),
  });
  if (existing) return existing;

  const [row] = await db
    .insert(users)
    .values({
      username: data.username,
      password: data.passwordHash,
      email: data.email,
      role: data.role,
      status: "active",
    })
    .returning();
  return row;
}

async function getOrCreateProfile(userId: number, data: Partial<typeof profile.$inferInsert>) {
  const existing = await db.query.profile.findFirst({
    where: eq(profile.userId, userId),
  });
  if (existing) return existing;

  const [row] = await db
    .insert(profile)
    .values({ userId, gender: "not_to_disclose", ...data })
    .returning();
  return row;
}

async function getOrCreateEvent(data: typeof events.$inferInsert) {
  const existing = await db.query.events.findFirst({
    where: eq(events.name, data.name),
  });
  if (existing) return existing;

  const [row] = await db.insert(events).values(data).returning();
  return row;
}

async function getOrCreateStall(data: typeof stalls.$inferInsert) {
  const existing = await db.query.stalls.findFirst({
    where: and(eq(stalls.name, data.name), eq(stalls.eventId, data.eventId)),
  });
  if (existing) return existing;

  const [row] = await db.insert(stalls).values(data).returning();
  return row;
}

async function getOrCreateProduct(data: typeof products.$inferInsert) {
  const existing = await db.query.products.findFirst({
    where: and(eq(products.name, data.name), eq(products.stallId, data.stallId)),
  });
  if (existing) return existing;

  const [row] = await db.insert(products).values(data).returning();
  return row;
}

async function seedBookFairDemo() {
  const passwordHash = await hashPassword("Demo@12345");

  // -----------------------------------------------------------------
  // 1. USERS + PROFILES
  // -----------------------------------------------------------------
  const organizer = await getOrCreateUser({
    username: "organizer_bookfair",
    email: "events@srilankabookfair.demo",
    role: "organizer",
    passwordHash,
  });
  await getOrCreateProfile(organizer.id, {
    firstName: "Sri Lanka",
    lastName: "Book Fair Committee",
    city: "Colombo",
    country: "Sri Lanka",
    bio: "Official organizing committee for island-wide book fair events.",
  });

  const vendorSeed = [
    {
      username: "sathsara_publishers",
      email: "info@sathsarapublishers.demo",
      first: "Nadeesha",
      last: "Perera",
      slug: "sathsara",
      name: "Sathsara Publishers",
      description: "Sinhala & English fiction, poetry, and short story collections from established and emerging local authors.",
      bio: "Independent Sinhala & English fiction publisher, established 1998.",
    },
    {
      username: "vidarshana_bookhouse",
      email: "contact@vidarshanabooks.demo",
      first: "Ruwan",
      last: "Jayasinghe",
      slug: "vidarshana",
      name: "Vidarshana Bookhouse",
      description: "Children's picture books, alphabet primers, and school-curriculum-aligned educational titles.",
      bio: "Specialists in children's and educational books for all ages.",
    },
    {
      username: "rasa_stationers",
      email: "hello@rasastationers.demo",
      first: "Chamara",
      last: "Wickramasinghe",
      slug: "rasa",
      name: "Rasa Stationers & Gifts",
      description: "Notebooks, bookmarks, tote bags, and handmade paper gifts inspired by Sri Lankan motifs.",
      bio: "Stationery, gifts and handmade paper goods for readers.",
    },
    {
      username: "kalabhoomi_art",
      email: "sales@kalabhoomiart.demo",
      first: "Dilani",
      last: "Rathnayake",
      slug: "kalabhoomi",
      name: "Kalabhoomi Art & Comics",
      description: "Comics, graphic novels, sketchbooks, and illustrated postcards from local artists.",
      bio: "Comics, graphic novels and illustrated art collectibles.",
    },
  ];

  const vendors = [];
  for (const v of vendorSeed) {
    const userRow = await getOrCreateUser({
      username: v.username,
      email: v.email,
      role: "vendor",
      passwordHash,
    });
    await getOrCreateProfile(userRow.id, {
      firstName: v.first,
      lastName: v.last,
      city: "Colombo",
      country: "Sri Lanka",
      occupation: "Business Owner",
      bio: v.bio,
      imageUrl: `https://picsum.photos/seed/vendor-${v.username}/300/300`,
    });
    vendors.push({ ...userRow, ...v });
  }

  const customerSeed = [
    { username: "amaya_silva", email: "amaya.silva@demo.lk", first: "Amaya", last: "Silva", city: "Colombo" },
    { username: "kasun_bandara", email: "kasun.bandara@demo.lk", first: "Kasun", last: "Bandara", city: "Negombo" },
    { username: "hiruni_de_zoysa", email: "hiruni.dz@demo.lk", first: "Hiruni", last: "De Zoysa", city: "Kandy" },
    { username: "tharindu_gunawardena", email: "tharindu.g@demo.lk", first: "Tharindu", last: "Gunawardena", city: "Galle" },
    { username: "sanduni_wijeratne", email: "sanduni.w@demo.lk", first: "Sanduni", last: "Wijeratne", city: "Colombo" },
    { username: "malith_karunaratne", email: "malith.k@demo.lk", first: "Malith", last: "Karunaratne", city: "Matara" },
    { username: "chathuri_ekanayake", email: "chathuri.e@demo.lk", first: "Chathuri", last: "Ekanayake", city: "Kurunegala" },
    { username: "ravindu_senanayake", email: "ravindu.s@demo.lk", first: "Ravindu", last: "Senanayake", city: "Colombo" },
  ];

  for (const c of customerSeed) {
    const userRow = await getOrCreateUser({
      username: c.username,
      email: c.email,
      role: "customer",
      passwordHash,
    });
    await getOrCreateProfile(userRow.id, {
      firstName: c.first,
      lastName: c.last,
      city: c.city,
      country: "Sri Lanka",
      imageUrl: `https://picsum.photos/seed/cust-${c.username}/300/300`,
    });
  }

  // -----------------------------------------------------------------
  // 2. EVENTS (Sept / Oct 2026)
  // -----------------------------------------------------------------
  const eventSeed = [
    {
      name: "Colombo International Book Fair 2026",
      description:
        "Sri Lanka's largest annual book fair, bringing together over 500 local and international publishers, authors, and readers at BMICH. Ten days of book launches, author meet-and-greets, and children's reading corners.",
      location: "BMICH, Bauddhaloka Mawatha",
      city: "Colombo",
      imageUrl: "https://picsum.photos/seed/event-colombo-bookfair/1200/600",
      eventCategory: "book-fair",
      coverImageUrl: "https://picsum.photos/seed/event-colombo-bookfair-cover/1200/600",
      startDate: new Date("2026-09-18T09:00:00+05:30"),
      endDate: new Date("2026-09-27T20:00:00+05:30"),
    },
    {
      name: "Kandy Book & Art Fair 2026",
      description:
        "A hill-country celebration of literature and local art, held over four days at Kandy City Centre Grounds. Features regional publishers, art stalls, and daily storytelling sessions for children.",
      location: "Kandy City Centre Grounds",
      city: "Kandy",
      imageUrl: "https://picsum.photos/seed/event-kandy-bookfair/1200/600",
      eventCategory: "book-fair",
      coverImageUrl: "https://picsum.photos/seed/event-kandy-bookfair-cover/1200/600",
      startDate: new Date("2026-10-02T09:00:00+05:30"),
      endDate: new Date("2026-10-05T19:00:00+05:30"),
    },
    {
      name: "Galle Literary Book Expo 2026",
      description:
        "A coastal book expo held near the historic Galle Fort, combining a literary festival atmosphere with stalls from publishers, comic artists, and stationery vendors.",
      location: "Galle Face Green Annex, Fort Road",
      city: "Galle",
      imageUrl: "https://picsum.photos/seed/event-galle-bookfair/1200/600",
      eventCategory: "book-fair",
      coverImageUrl: "https://picsum.photos/seed/event-galle-bookfair-cover/1200/600",
      startDate: new Date("2026-10-16T09:00:00+05:30"),
      endDate: new Date("2026-10-19T19:00:00+05:30"),
    },
  ];

  const eventRows = [];
  for (const e of eventSeed) {
    const row = await getOrCreateEvent({
      ...e,
      vendorId: organizer.id,
      approved: true,
      archived: false,
    });
    eventRows.push(row);
  }

  // -----------------------------------------------------------------
  // 3. STALLS — each vendor runs a stall at every event
  // -----------------------------------------------------------------
  const stallLocations = ["Hall A - A12", "Hall B - B04", "Row 3 - R3-08", "Entrance Row - E-02"];
  const stallMap: Record<string, number> = {};

  for (const ev of eventRows) {
    for (let i = 0; i < vendors.length; i++) {
      const v = vendors[i];
      const stallRow = await getOrCreateStall({
        name: v.name,
        description: v.description,
        imageUrl: `https://picsum.photos/seed/stall-${v.slug}-${ev.id}/800/500`,
        location: stallLocations[i],
        eventId: ev.id,
        vendorId: v.id,
        approved: true,
        archived: false,
      });
      stallMap[`${ev.id}-${v.slug}`] = stallRow.id;
    }
  }

  // -----------------------------------------------------------------
  // 4. PRODUCTS — same catalog per vendor, replicated across their stalls
  //    price stored in cents (LKR value * 100)
  // -----------------------------------------------------------------
  type ProductSeed = {
    name: string;
    description: string;
    priceLKR: number;
    category: "souvenir" | "giveaway" | "promotional";
    stock: number;
  };

  const catalogs: Record<string, ProductSeed[]> = {
    sathsara: [
      { name: "Ran Kevita", description: "A contemporary Sinhala novel exploring family and memory across three generations.", priceLKR: 850, category: "souvenir", stock: 60 },
      { name: "Sandella Sihina", description: "A collection of modern Sinhala poetry on love and longing.", priceLKR: 650, category: "souvenir", stock: 45 },
      { name: "Mathaka Warusha", description: "Short stories set in rural Sri Lanka during the monsoon season.", priceLKR: 720, category: "souvenir", stock: 50 },
      { name: "Eheliyagoda Wisthara", description: "A historical fiction account of a hill-country village through colonial times.", priceLKR: 990, category: "souvenir", stock: 35 },
      { name: "Nisala Ganga", description: "A quiet, character-driven novel about a river town in the dry zone.", priceLKR: 875, category: "souvenir", stock: 40 },
    ],
    vidarshana: [
      { name: "ABC Rhymes for Kids", description: "Bilingual alphabet rhymes with bright illustrations for early readers.", priceLKR: 450, category: "giveaway", stock: 80 },
      { name: "Sinhala Akuru Potha", description: "Sinhala alphabet workbook with tracing pages for preschoolers.", priceLKR: 350, category: "giveaway", stock: 100 },
      { name: "General Knowledge Grade 5", description: "Scholarship-exam-aligned general knowledge revision guide.", priceLKR: 590, category: "promotional", stock: 70 },
      { name: "Fun with Numbers", description: "Illustrated early-math activity book for ages 4-7.", priceLKR: 420, category: "giveaway", stock: 65 },
      { name: "Sri Lankan Folk Tales", description: "Ten classic Sri Lankan folk tales retold for young readers.", priceLKR: 680, category: "souvenir", stock: 55 },
    ],
    rasa: [
      { name: "Bookmark Set - Ceylon Tea Design", description: "Set of 5 laminated bookmarks featuring Ceylon tea estate illustrations.", priceLKR: 250, category: "souvenir", stock: 120 },
      { name: "Leather-Bound Notebook", description: "A6 handmade leather-bound journal with unlined pages.", priceLKR: 1200, category: "souvenir", stock: 40 },
      { name: "Book Fair Tote Bag", description: "Canvas tote bag printed with this year's book fair artwork.", priceLKR: 550, category: "promotional", stock: 90 },
      { name: "Handmade Paper Greeting Cards (Pack of 5)", description: "Assorted handmade paper cards with botanical prints.", priceLKR: 480, category: "giveaway", stock: 75 },
      { name: "Wooden Pen Set", description: "Set of 2 handcrafted wooden ballpoint pens in a gift box.", priceLKR: 950, category: "souvenir", stock: 50 },
    ],
    kalabhoomi: [
      { name: "Sooriya Katha - Vol 1", description: "Locally illustrated comic following a young hero across ancient Ceylon.", priceLKR: 400, category: "souvenir", stock: 70 },
      { name: "Ceylon Legends Graphic Novel", description: "A graphic novel retelling of well-known Sri Lankan legends.", priceLKR: 750, category: "souvenir", stock: 45 },
      { name: "Watercolor Postcards Set", description: "Set of 8 postcards featuring watercolor scenes of Sri Lanka.", priceLKR: 350, category: "giveaway", stock: 100 },
      { name: "Fantasy Sketchbook", description: "A5 sketchbook with a fantasy-themed illustrated cover.", priceLKR: 600, category: "souvenir", stock: 60 },
      { name: "Collectible Bookmarks - Author Edition", description: "Limited-run bookmarks signed by featured local illustrators.", priceLKR: 300, category: "promotional", stock: 30 },
    ],
  };

  for (const ev of eventRows) {
    for (const v of vendors) {
      const stallId = stallMap[`${ev.id}-${v.slug}`];
      const catalog = catalogs[v.slug];
      for (const p of catalog) {
        await getOrCreateProduct({
          name: p.name,
          description: p.description,
          price: p.priceLKR * 100,
          imageUrl: `https://picsum.photos/seed/product-${v.slug}-${p.name.replace(/\s+/g, "-").toLowerCase()}-${ev.id}/500/500`,
          category: p.category,
          stallId,
          approved: true,
          stock: p.stock,
          availableToDispatch: Math.floor(p.stock * 0.7),
          dispatchStock: 0,
          archived: false,
        });
      }
    }
  }

  console.log("✅ Book fair demo seed complete");
}

seedBookFairDemo()
  .catch((error) => {
    console.error("Error seeding book fair demo data:", error);
  })
  .finally(() => {
    process.exit(0);
  });
