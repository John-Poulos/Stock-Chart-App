// server.js - WITH SYMBOL SEARCH ENDPOINT
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// ENDPOINT 1: Stock data (original)
// ============================================
app.get('/api/stock/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const { interval = '1day', outputsize = '500' } = req.query;

  try {
    const response = await axios.get('https://api.twelvedata.com/time_series', {
      params: {
        symbol: symbol.toUpperCase(),
        interval,
        outputsize,
        apikey: process.env.TWELVEDATA_API_KEY,
      },
      timeout: 10000,
    });

    res.json(response.data);
  } catch (err) {
    console.error('Twelve Data error:', err.response?.data || err.message);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch stock data' 
    });
  }
});

// ============================================
// ENDPOINT 2: Symbol search (NEW!)
// ============================================
/**
 * Symbol Search Endpoint
 * 
 * PURPOSE: Search for stock symbols by company name
 * 
 * EXAMPLE REQUEST: GET /api/symbol-search?query=apple
 * 
 * EXAMPLE RESPONSE:
 * {
 *   "data": [
 *     {
 *       "symbol": "AAPL",
 *       "instrument_name": "Apple Inc",
 *       "exchange": "NASDAQ",
 *       "mic_code": "XNAS",
 *       "exchange_timezone": "America/New_York",
 *       "instrument_type": "Common Stock",
 *       "country": "United States",
 *       "currency": "USD"
 *     },
 *     ...
 *   ],
 *   "status": "ok"
 * }
 */
app.get('/api/symbol-search', async (req, res) => {
  // STEP 1: Get the search query from URL parameters
  const { query } = req.query;

  // STEP 2: Validate that we have a search query
  if (!query || query.trim().length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Query parameter is required'
    });
  }

  try {
    // STEP 3: Call Twelve Data's symbol_search endpoint
    const response = await axios.get('https://api.twelvedata.com/symbol_search', {
      params: {
        symbol: query.trim(),
        apikey: process.env.TWELVEDATA_API_KEY,
      },
      timeout: 10000,  // 10 second timeout
    });

    // STEP 4: Check if we got valid data back
    if (!response.data || !response.data.data) {
      return res.json({
        status: 'ok',
        data: [],  // Return empty array if no results
        message: 'No results found'
      });
    }

    // STEP 5: Filter and limit results
    // Only return stocks (not ETFs, indexes, etc) from major exchanges
    const filteredResults = response.data.data
      .filter(item => {
        // Only include common stocks
        const isStock = item.instrument_type === 'Common Stock';
        // Only include major US exchanges
        const isMajorExchange = ['NASDAQ', 'NYSE', 'AMEX'].includes(item.exchange);
        return isStock && isMajorExchange;
      })
      .slice(0, 10);  // Limit to 10 results

    // STEP 6: Send filtered results back to frontend
    res.json({
      status: 'ok',
      data: filteredResults,
      count: filteredResults.length
    });

  } catch (err) {
    console.error('Symbol search error:', {
      query,
      error: err.response?.data || err.message,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to search symbols'
    });
  }
});

// ============================================
// ERROR HANDLERS
// ============================================
app.use((req, res) => {
  res.status(404).json({ 
    status: 'error', 
    message: 'Endpoint not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ API Key configured: ${!!process.env.TWELVEDATA_API_KEY}`);
});