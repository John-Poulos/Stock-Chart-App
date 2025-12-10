# Stock Chart App with Z-Score Indicator

A web-based stock charting application with mean reversion z-score analysis.

## Features
- Real-time stock data from Twelve Data API
- Interactive price charts
- Z-score mean reversion indicator
- Symbol search by company name
- Adjustable lookback periods

## Setup

1. Clone the repository:
```bash
   git clone https://github.com/yourusername/stock-chart-app.git
   cd stock-chart-app
```

2. Install dependencies:
```bash
   npm install
```

3. Create `.env` file with your API key:
```
   TWELVEDATA_API_KEY=your_key_here
   PORT=3000
```

4. Run the app:
```bash
   npm start
```

5. Open http://localhost:3000

## Deployment

See [Render deployment guide](https://render.com/docs/deploy-node-express-app)