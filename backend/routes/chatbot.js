const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const Restaurant = require('../models/Restaurant');
const Reservation = require('../models/Reservation');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Tool definitions for OpenAI function calling
const tools = [
  {
    type: 'function',
    function: {
      name: 'search_restaurants',
      description: 'Search for restaurants in Sri Lanka based on city, cuisine type, price range, or name. ALWAYS use this tool when the user asks to find, discover, or recommend restaurants.',
      parameters: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: 'City name in Sri Lanka (e.g., Colombo, Kandy, Galle, Negombo, Jaffna)',
          },
          cuisineType: {
            type: 'string',
            description: 'Type of cuisine (e.g., Seafood, Sri Lankan, Indian, Chinese, Fusion)',
          },
          priceRange: {
            type: 'string',
            enum: ['budget', 'mid', 'upscale', 'fine'],
            description: 'Price range: budget (under LKR 1000), mid (LKR 1000-5000), upscale (LKR 5000-15000), fine (above LKR 15000)',
          },
          keyword: {
            type: 'string',
            description: 'Search keyword to match against restaurant name or description',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'make_reservation',
      description: 'Make a table reservation at a restaurant. Use this when the user wants to book a table and has provided all required details.',
      parameters: {
        type: 'object',
        properties: {
          restaurantId: {
            type: 'string',
            description: 'The MongoDB ID of the restaurant to book',
          },
          restaurantName: {
            type: 'string',
            description: 'The name of the restaurant',
          },
          customerName: {
            type: 'string',
            description: 'Full name of the customer',
          },
          customerEmail: {
            type: 'string',
            description: 'Email address of the customer',
          },
          customerPhone: {
            type: 'string',
            description: 'Phone number of the customer',
          },
          partySize: {
            type: 'number',
            description: 'Number of people in the party',
          },
          reservationDate: {
            type: 'string',
            description: 'Date and time of the reservation in ISO format (e.g., 2024-03-15T19:00:00)',
          },
          specialRequests: {
            type: 'string',
            description: 'Any special requests or dietary requirements',
          },
        },
        required: ['restaurantId', 'restaurantName', 'customerName', 'partySize', 'reservationDate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_restaurant_details',
      description: 'Get detailed information about a specific restaurant.',
      parameters: {
        type: 'object',
        properties: {
          restaurantId: {
            type: 'string',
            description: 'The MongoDB ID of the restaurant',
          },
        },
        required: ['restaurantId'],
      },
    },
  },
];

// Execute tool calls
async function executeTool(toolName, args) {
  if (toolName === 'search_restaurants') {
    // Build query — do NOT filter by isActive so all restaurants are searchable
    const query = {};
    if (args.city) query.city = new RegExp(args.city, 'i');
    if (args.cuisineType) query.cuisineType = new RegExp(args.cuisineType, 'i');
    if (args.priceRange) query.priceRange = args.priceRange;
    if (args.keyword) {
      query.$or = [
        { name: new RegExp(args.keyword, 'i') },
        { description: new RegExp(args.keyword, 'i') },
        { city: new RegExp(args.keyword, 'i') },
        { cuisineType: new RegExp(args.keyword, 'i') },
      ];
    }

    const restaurants = await Restaurant.find(query).limit(6).lean();

    if (restaurants.length === 0) {
      // Fallback: show all available restaurants
      const allRestaurants = await Restaurant.find({}).limit(6).lean();
      if (allRestaurants.length === 0) {
        return { found: false, message: 'No restaurants are currently listed on the platform.' };
      }
      return {
        found: true,
        count: allRestaurants.length,
        note: 'No exact match found — showing all available restaurants instead.',
        restaurants: allRestaurants.map(r => ({
          id: r._id.toString(),
          name: r.name,
          city: r.city,
          cuisineType: r.cuisineType,
          priceRange: r.priceRange,
          averageRating: r.averageRating,
          totalReviews: r.totalReviews,
          description: r.description,
          address: r.address,
          phone: r.phone,
        })),
      };
    }

    return {
      found: true,
      count: restaurants.length,
      restaurants: restaurants.map(r => ({
        id: r._id.toString(),
        name: r.name,
        city: r.city,
        cuisineType: r.cuisineType,
        priceRange: r.priceRange,
        averageRating: r.averageRating,
        totalReviews: r.totalReviews,
        description: r.description,
        address: r.address,
        phone: r.phone,
      })),
    };
  }

  if (toolName === 'make_reservation') {
    const reservation = await Reservation.create({
      restaurant: args.restaurantId,
      customerName: args.customerName,
      customerEmail: args.customerEmail || '',
      customerPhone: args.customerPhone || '',
      partySize: args.partySize,
      reservationDate: new Date(args.reservationDate),
      specialRequests: args.specialRequests || '',
      source: 'chatbot',
      language: 'en',
      status: 'pending',
    });

    return {
      success: true,
      reservationId: reservation._id.toString(),
      message: `Reservation created successfully at ${args.restaurantName} for ${args.partySize} people.`,
    };
  }

  if (toolName === 'get_restaurant_details') {
    const restaurant = await Restaurant.findById(args.restaurantId).lean();
    if (!restaurant) return { found: false };

    return {
      found: true,
      restaurant: {
        id: restaurant._id.toString(),
        name: restaurant.name,
        description: restaurant.description,
        address: restaurant.address,
        city: restaurant.city,
        phone: restaurant.phone,
        email: restaurant.email,
        cuisineType: restaurant.cuisineType,
        priceRange: restaurant.priceRange,
        averageRating: restaurant.averageRating,
        openingHours: restaurant.openingHours,
      },
    };
  }

  return { error: 'Unknown tool' };
}

// Build language-specific system prompt
function buildSystemPrompt(language) {
  const langInstructions = {
    en: 'You MUST respond in English only.',
    si: 'ඔබ සිංහල භාෂාවෙන් පමණක් පිළිතුරු දිය යුතුය. ALL your responses must be in Sinhala script. Do not use English words except for restaurant names, addresses, and phone numbers.',
    ta: 'நீங்கள் தமிழ் மொழியில் மட்டுமே பதில் அளிக்க வேண்டும். ALL your responses must be in Tamil script. Do not use English words except for restaurant names, addresses, and phone numbers.',
  };

  return `You are Nila, the warm and enthusiastic food guide for SL Eats Connect — Sri Lanka's restaurant discovery platform. You love food, you love Sri Lanka, and you genuinely enjoy helping people find the perfect dining experience.

LANGUAGE RULE: ${langInstructions[language] || langInstructions.en}

YOUR PERSONALITY:
- Warm, conversational, and genuinely enthusiastic about Sri Lankan food culture
- Talk like a knowledgeable local friend giving advice, not a formal assistant
- Show excitement about great restaurants ("Oh, you're going to love this one!", "This place is a hidden gem!")
- Empathise with the user's needs ("A romantic dinner — how lovely! Let me find you something special 🌹")
- Never sound robotic — always add a personal, human touch
- Use emojis sparingly but naturally (🍛 🌟 📍 ❤️)

YOUR PRIMARY GOALS:
1. Help users discover restaurants in Sri Lanka — ALWAYS call search_restaurants when asked
2. Give personalised, enthusiastic recommendations with context, not just a dry list
3. Help make table reservations through natural conversation

CRITICAL RULES:
- ALWAYS use the search_restaurants tool when user asks to find, discover, or recommend any restaurant — never say you cannot search
- If no exact match is found, show what IS available and explain warmly ("I couldn't find exactly that, but here are some wonderful options!")
- When showing restaurants, present them conversationally — highlight what makes each one special
- Price ranges: budget = under LKR 1,000 per person, mid = LKR 1,000–5,000, upscale = LKR 5,000–15,000, fine dining = above LKR 15,000
- For romantic dinners, suggest upscale or fine dining and add a warm personal touch
- To make a reservation, collect: customer name, party size, date and time (email and phone optional but helpful)
- Always confirm reservation details in a friendly way before booking
- After successful booking, celebrate with the user and wish them a wonderful meal

Sri Lankan cities available: Colombo, Kandy, Galle, Negombo, Jaffna

If the user asks something unrelated to restaurants or food, gently and warmly redirect them back to what you do best.`;
}

// @route POST /api/chatbot/message
router.post('/message', async (req, res) => {
  try {
    const { message, conversationHistory = [], language = 'en' } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message is required' });
    }

    const messages = [
      { role: 'system', content: buildSystemPrompt(language) },
      ...conversationHistory.slice(-10),
      { role: 'user', content: message },
    ];

    let response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      tools,
      tool_choice: 'auto',
      temperature: 0.8,
      max_tokens: 1200,
    });

    let assistantMessage = response.choices[0].message;

    // Handle tool calls
    while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      messages.push(assistantMessage);

      const toolResults = await Promise.all(
        assistantMessage.tool_calls.map(async (toolCall) => {
          const args = JSON.parse(toolCall.function.arguments);
          const result = await executeTool(toolCall.function.name, args);
          return {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          };
        })
      );

      messages.push(...toolResults);

      response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        tools,
        tool_choice: 'auto',
        temperature: 0.8,
        max_tokens: 1200,
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
    if (error.status === 401) {
      return res.status(500).json({ message: 'Invalid OpenAI API key. Please check your .env file.' });
    }
    if (error.status === 429) {
      return res.status(500).json({ message: 'OpenAI rate limit reached. Please try again in a moment.' });
    }
    res.status(500).json({ message: 'Chatbot error: ' + error.message });
  }
});

// @route GET /api/chatbot/test
router.get('/test', (req, res) => {
  res.json({ message: 'Chatbot route works!' });
});

module.exports = router;
