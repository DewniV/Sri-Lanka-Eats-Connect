const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const nodemailer = require('nodemailer');
const Restaurant = require('../models/Restaurant');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: false },
  });
};

async function notifyVendorOfReservation(reservation, restaurant) {
  const transporter = createTransporter();
  if (!transporter) return;
  try {
    const vendor = await User.findById(restaurant.owner).lean();
    if (!vendor || !vendor.email) return;
    const dateStr = new Date(reservation.reservationDate).toLocaleString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    await transporter.sendMail({
      from: `"SL Eats Connect" <${process.env.SMTP_USER}>`,
      to: vendor.email,
      subject: `New Reservation at ${restaurant.name} — ${dateStr}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#c0392b;padding:20px;text-align:center"><h1 style="color:white;margin:0">New Reservation</h1></div><div style="padding:30px;background:#fff"><h2>You have a new table reservation! 🎉</h2><table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px;font-weight:bold">Restaurant</td><td style="padding:8px">${restaurant.name}</td></tr><tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">Customer</td><td style="padding:8px">${reservation.customerName}</td></tr><tr><td style="padding:8px;font-weight:bold">Date & Time</td><td style="padding:8px">${dateStr}</td></tr><tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">Party Size</td><td style="padding:8px">${reservation.partySize} people</td></tr><tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${reservation.customerEmail || 'Not provided'}</td></tr><tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">Phone</td><td style="padding:8px">${reservation.customerPhone || 'Not provided'}</td></tr><tr><td style="padding:8px;font-weight:bold">Special Requests</td><td style="padding:8px">${reservation.specialRequests || 'None'}</td></tr></table><p style="margin-top:20px">Please log in to your <strong>Vendor Dashboard</strong> to confirm or manage this reservation.</p><p style="color:#666;font-size:14px">Booked via Nila AI Chatbot on SL Eats Connect</p></div></div>`,
    });
  } catch (err) { console.error('Failed to send vendor email:', err.message); }
}

async function sendCustomerConfirmationEmail(reservation, restaurantName) {
  const transporter = createTransporter();
  if (!transporter || !reservation.customerEmail) return;
  try {
    const dateStr = new Date(reservation.reservationDate).toLocaleString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    await transporter.sendMail({
      from: `"SL Eats Connect" <${process.env.SMTP_USER}>`,
      to: reservation.customerEmail,
      subject: `Reservation Confirmed — ${restaurantName}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#c0392b;padding:20px;text-align:center"><h1 style="color:white;margin:0">SL Eats Connect</h1></div><div style="padding:30px;background:#fff"><h2>Your reservation is confirmed! 🎉</h2><table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px;font-weight:bold">Restaurant</td><td style="padding:8px">${restaurantName}</td></tr><tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">Name</td><td style="padding:8px">${reservation.customerName}</td></tr><tr><td style="padding:8px;font-weight:bold">Date & Time</td><td style="padding:8px">${dateStr}</td></tr><tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">Party Size</td><td style="padding:8px">${reservation.partySize} people</td></tr>${reservation.specialRequests ? `<tr><td style="padding:8px;font-weight:bold">Special Requests</td><td style="padding:8px">${reservation.specialRequests}</td></tr>` : ''}</table><p style="margin-top:20px;color:#666;font-size:14px">Booked via Nila AI Chatbot on SL Eats Connect</p></div></div>`,
    });
  } catch (err) { console.error('Failed to send customer email:', err.message); }
}

const tools = [
  { type: 'function', function: { name: 'search_restaurants', description: 'Search for restaurants in Sri Lanka based on city, cuisine type, price range, or name. ALWAYS use this tool when the user asks to find, discover, or recommend restaurants.', parameters: { type: 'object', properties: { city: { type: 'string', description: 'City name in Sri Lanka (e.g., Colombo, Kandy, Galle, Negombo, Jaffna)' }, cuisineType: { type: 'string', description: 'Type of cuisine (e.g., Seafood, Sri Lankan, Indian, Chinese, Fusion)' }, priceRange: { type: 'string', enum: ['budget', 'mid', 'upscale', 'fine'], description: 'Price range' }, keyword: { type: 'string', description: 'Search keyword' } }, required: [] } } },
  { type: 'function', function: { name: 'check_availability', description: 'Check real-time table availability at a specific restaurant. Always call this before make_reservation.', parameters: { type: 'object', properties: { restaurantId: { type: 'string', description: 'The MongoDB ID of the restaurant' }, restaurantName: { type: 'string', description: 'The name of the restaurant' } }, required: ['restaurantId'] } } },
  { type: 'function', function: { name: 'make_reservation', description: 'Make a table reservation. ONLY call this after collecting: customer name, party size, date, time, AND after user has confirmed the booking summary.', parameters: { type: 'object', properties: { restaurantId: { type: 'string', description: 'The exact 24-character MongoDB ObjectId from search_restaurants result. Never invent or guess this value.' }, restaurantName: { type: 'string' }, customerName: { type: 'string' }, customerEmail: { type: 'string' }, customerPhone: { type: 'string' }, partySize: { type: 'number' }, reservationDate: { type: 'string', description: 'ISO format date+time e.g. 2026-05-12T20:00:00' }, specialRequests: { type: 'string' } }, required: ['restaurantId', 'restaurantName', 'customerName', 'partySize', 'reservationDate'] } } },
  { type: 'function', function: { name: 'get_restaurant_details', description: 'Get detailed information about a specific restaurant.', parameters: { type: 'object', properties: { restaurantId: { type: 'string' } }, required: ['restaurantId'] } } },
];

async function executeTool(toolName, args) {
  if (toolName === 'search_restaurants') {
    const query = { isActive: true };
    if (args.city) query.city = new RegExp(args.city, 'i');
    if (args.cuisineType) query.cuisineType = new RegExp(args.cuisineType, 'i');
    if (args.priceRange) query.priceRange = args.priceRange;
    if (args.keyword) { query.$or = [{ name: new RegExp(args.keyword, 'i') }, { description: new RegExp(args.keyword, 'i') }, { city: new RegExp(args.keyword, 'i') }, { cuisineType: new RegExp(args.keyword, 'i') }]; }
    let restaurants = await Restaurant.find(query).limit(6).lean();
    if (restaurants.length === 0) restaurants = await Restaurant.find({ isActive: true }).limit(6).lean();
    if (restaurants.length === 0) return { found: false, message: 'No restaurants are currently listed on the platform.' };
    return { found: true, count: restaurants.length, restaurants: restaurants.map(r => ({ id: r._id.toString(), name: r.name, city: r.city, cuisineType: r.cuisineType, priceRange: r.priceRange, averageRating: r.averageRating, totalReviews: r.totalReviews, description: r.description, address: r.address, phone: r.phone, availableTables: r.availableTables, availabilityNote: r.availabilityNote })) };
  }

  if (toolName === 'check_availability') {
    if (!args.restaurantId || !/^[a-f0-9]{24}$/i.test(args.restaurantId)) {
      return { found: false, message: 'Invalid restaurant ID. Please call search_restaurants first and use the exact id field from the results.' };
    }
    const restaurant = await Restaurant.findById(args.restaurantId).lean();
    if (!restaurant) return { found: false, message: 'Restaurant not found.' };
    // If availableTables is not set by vendor, default to available (assume tables are open)
    const available = restaurant.availableTables === undefined || restaurant.availableTables === null ? true : restaurant.availableTables > 0;
    return { found: true, restaurantName: restaurant.name, totalTables: restaurant.totalTables, availableTables: restaurant.availableTables, available, availabilityNote: restaurant.availabilityNote || '', message: available ? `${restaurant.name} has ${restaurant.availableTables} table(s) available. You can proceed to confirm the booking.` : `${restaurant.name} is fully booked. ${restaurant.availabilityNote || ''}` };
  }

  if (toolName === 'make_reservation') {
    // Validate restaurantId is a valid MongoDB ObjectId before querying
    if (!args.restaurantId || !/^[a-f0-9]{24}$/i.test(args.restaurantId)) {
      return { success: false, message: 'Invalid restaurant ID. Please search for the restaurant again using search_restaurants and use the exact id from the results.' };
    }
    const restaurant = await Restaurant.findById(args.restaurantId);
    if (!restaurant) return { success: false, message: 'Restaurant not found.' };
    // Only block if vendor has explicitly set availableTables to 0
    if (restaurant.availableTables !== undefined && restaurant.availableTables !== null && restaurant.availableTables <= 0) return { success: false, message: `Sorry, ${args.restaurantName} is fully booked right now.` };
    // Try to link reservation to a registered user account by email
    let customerId = null;
    if (args.customerEmail) {
      const userAccount = await User.findOne({ email: args.customerEmail.toLowerCase() }).lean();
      if (userAccount) customerId = userAccount._id;
    }
    const reservation = await Reservation.create({ restaurant: args.restaurantId, customerName: args.customerName, customerEmail: args.customerEmail || '', customerPhone: args.customerPhone || '', partySize: args.partySize, reservationDate: new Date(args.reservationDate), specialRequests: args.specialRequests || '', source: 'chatbot', status: 'pending', ...(customerId && { customer: customerId }) });
    await Restaurant.findByIdAndUpdate(args.restaurantId, { $inc: { availableTables: -1 }, lastAvailabilityUpdate: new Date() });
    notifyVendorOfReservation(reservation, restaurant);
    sendCustomerConfirmationEmail(reservation, restaurant.name);
    const dateStr = new Date(args.reservationDate).toLocaleString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return { success: true, reservationId: reservation._id.toString(), customerName: args.customerName, restaurantName: args.restaurantName, partySize: args.partySize, dateStr, message: `Reservation confirmed! ${args.customerName} is booked at ${args.restaurantName} for ${args.partySize} people on ${dateStr}.` };
  }

  if (toolName === 'get_restaurant_details') {
    const restaurant = await Restaurant.findById(args.restaurantId).lean();
    if (!restaurant) return { found: false };
    return { found: true, restaurant: { id: restaurant._id.toString(), name: restaurant.name, description: restaurant.description, address: restaurant.address, city: restaurant.city, phone: restaurant.phone, email: restaurant.email, cuisineType: restaurant.cuisineType, priceRange: restaurant.priceRange, averageRating: restaurant.averageRating, openingHours: restaurant.openingHours, availableTables: restaurant.availableTables, availabilityNote: restaurant.availabilityNote } };
  }

  return { error: 'Unknown tool' };
}

function buildSystemPrompt(language) {
  const now = new Date();
  const todayStr = now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const tomorrowISO = tomorrowDate.toISOString().split('T')[0];
  const todayISO = now.toISOString().split('T')[0];

  const langInstructions = {
    en: 'You MUST respond in English only.',
    si: 'ඔබ සිංහල භාෂාවෙන් පමණක් පිළිතුරු දිය යුතුය. ALL responses must be in Sinhala script. Only use English for restaurant names, addresses, and phone numbers.',
    ta: 'நீங்கள் தமிழ் மொழியில் மட்டுமே பதில் அளிக்க வேண்டும். ALL responses must be in Tamil script. Only use English for restaurant names, addresses, and phone numbers.',
  };

  return `You are Nila, the warm and enthusiastic food guide for SL Eats Connect — Sri Lanka's restaurant discovery platform.

LANGUAGE RULE: ${langInstructions[language] || langInstructions.en}

CURRENT DATE FACTS — USE THESE EXACTLY, NEVER GUESS OR INVENT DATES:
- Today is: ${todayStr} (ISO: ${todayISO})
- Tomorrow is: ${tomorrowStr} (ISO: ${tomorrowISO})
- Current year: ${now.getFullYear()}
- When user says "tomorrow" → use ISO date: ${tomorrowISO}
- When user says "today" → use ISO date: ${todayISO}
- For any relative date ("next Friday", "this weekend") → calculate from today (${todayISO})

YOUR PERSONALITY & WRITING STYLE:
- You are warm, friendly, and enthusiastic about Sri Lankan food — like a knowledgeable local friend texting someone
- Write in natural flowing sentences, NOT bullet points or lists
- NEVER use markdown symbols: no **, no *, no #, no ---, no backticks
- When mentioning a restaurant, weave the details naturally into sentences
- Example of WRONG style: "**Ministry of Crab** \n- 📍 Location: Colombo \n- 🌟 Rating: 4.8"
- Example of RIGHT style: "Oh you have to try Ministry of Crab! 🦀 It's right in the heart of Colombo at the Old Dutch Hospital — absolutely iconic, rated 4.8 by hundreds of diners. Want me to book a table?"
- Use emojis naturally and sparingly (🍛 🌟 🦀 ❤️) — like a friend would in a text message
- When listing multiple restaurants, describe each one in 1-2 natural sentences, separated by a blank line
- Sound excited and personal: "Oh this one is amazing!", "You're going to love this!", "This is a hidden gem!"
- Keep responses concise — don't write essays, keep it like a friendly chat

RESERVATION PROCESS — FOLLOW THIS EXACTLY:
When a user wants to book at a specific restaurant, collect in order:
  STEP 1: DATE — ask "What date were you thinking?"
  STEP 2: TIME — ask "And what time works for you?"
  STEP 3: PARTY SIZE — ask "How many people will be dining?"
  STEP 4: NAME — ask "What name should I put the reservation under?"
  STEP 5: OPTIONAL — ask for email or phone for confirmation
  STEP 6: Call check_availability
  STEP 7: If available — show a clear summary of ALL details and ask "Shall I confirm this booking? ✅"
  STEP 8: When user says yes/confirm/go ahead → IMMEDIATELY call make_reservation in the SAME response. Do NOT say "I'll get back to you" or "let me check" — call the tool right now.
  STEP 9: After make_reservation returns success → tell the user their booking is confirmed with all details and celebrate 🎉

CRITICAL RULES — FOLLOW THESE WITHOUT EXCEPTION:
- NEVER invent or guess dates — always use the CURRENT DATE FACTS above
- NEVER say "I'll get back to you shortly" after getting confirmation — call make_reservation immediately
- NEVER leave a reservation unfinished — always complete it or explain clearly why not
- After check_availability confirms tables are available, proceed directly to the summary
- After user confirms → call make_reservation in that same message turn

ANTI-HALLUCINATION RULES — CRITICAL:
- You MUST ONLY mention restaurants that were returned by the search_restaurants tool in this conversation
- NEVER mention, suggest, or describe a restaurant from your training knowledge (e.g. Ministry of Crab, Pedlar's Inn, Poonie's Kitchen, etc.) unless it appeared in a search_restaurants tool result in THIS conversation
- NEVER invent a restaurant ID — the restaurantId you pass to check_availability and make_reservation MUST be the exact 24-character hexadecimal MongoDB ObjectId string from the "id" field in the search_restaurants result. It will look like "6634a2b1c3d4e5f6a7b8c9d0". NEVER use a name, slug, or any other format.
- If a user asks about a specific restaurant by name, call search_restaurants with that name as the keyword first, then respond based on what the tool returns
- If search_restaurants returns no results for a city or cuisine, tell the user honestly: "I don't have any restaurants listed in [city] yet on our platform" — do NOT suggest restaurants from your own knowledge
- The only restaurants that exist on SL Eats Connect are the ones returned by the search_restaurants tool

SEARCH RULES:
- ALWAYS call search_restaurants first before mentioning any restaurant
- Present results conversationally — highlight what makes each restaurant special
- Mention low availability: "Only 2 tables left — book soon!"
- If no results found for the specific filters, try a broader search (remove city or cuisine filter) before giving up

Price ranges: budget = under LKR 1,000 | mid = LKR 1,000–5,000 | upscale = LKR 5,000–15,000 | fine = above LKR 15,000
Cities: Colombo, Kandy, Galle, Negombo, Jaffna

If asked something unrelated to food or restaurants, gently redirect the user.`;
}

router.post('/message', async (req, res) => {
  try {
    const { message, conversationHistory = [], language = 'en' } = req.body;
    if (!message || message.trim() === '') return res.status(400).json({ message: 'Message is required' });

    const messages = [
      { role: 'system', content: buildSystemPrompt(language) },
      ...conversationHistory.slice(-14),
      { role: 'user', content: message },
    ];

    let response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 1500,
    });

    let assistantMessage = response.choices[0].message;

    let toolLoopCount = 0;
    while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0 && toolLoopCount < 6) {
      toolLoopCount++;
      messages.push(assistantMessage);
      const toolResults = await Promise.all(
        assistantMessage.tool_calls.map(async (toolCall) => {
          const args = JSON.parse(toolCall.function.arguments);
          const result = await executeTool(toolCall.function.name, args);
          return { role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(result) };
        })
      );
      messages.push(...toolResults);
      response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        tools,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 1500,
      });
      assistantMessage = response.choices[0].message;
    }

    res.json({
      reply: assistantMessage.content,
      updatedHistory: [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: assistantMessage.content },
      ],
    });
  } catch (error) {
    console.error('Chatbot error:', error.message);
    if (error.status === 401) return res.status(500).json({ message: 'Invalid OpenAI API key.' });
    if (error.status === 429) return res.status(500).json({ message: 'OpenAI rate limit reached. Please try again in a moment.' });
    res.status(500).json({ message: 'Chatbot error: ' + error.message });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'Chatbot route works!', currentDate: new Date().toISOString() });
});

module.exports = router;
