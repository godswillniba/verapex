import React, { useState, useEffect, useRef } from 'react';
import './StockTracker.css';

// Define types for stock data
interface StockData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: {
    price: number[];
  };
}

interface ChartData {
  labels: string[];
  prices: number[];
}

interface TooltipData {
  visible: boolean;
  x: number;
  y: number;
  price: number;
  date: string;
  change: string;
  stockId: string;
}

const StockTracker: React.FC = () => {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<Record<string, ChartData>>({});
  const [tooltipData, setTooltipData] = useState<TooltipData>({
    visible: false,
    x: 0,
    y: 0,
    price: 0,
    date: '',
    change: '0%',
    stockId: ''
  });
  const [selectedPoints, setSelectedPoints] = useState<Record<string, number | null>>({});
  const [hoveredPoints, setHoveredPoints] = useState<Record<string, number | null>>({});
  const chartRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // List of stocks to track (example stock symbols)
  const stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN'];

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // In a real app, you would fetch from a stock API
        // This is mock data for demonstration
        const mockData: StockData[] = stockSymbols.map(symbol => ({
          id: symbol.toLowerCase(),
          symbol: symbol,
          name: getStockName(symbol),
          current_price: Math.random() * 1000 + 100,
          price_change_percentage_24h: (Math.random() * 10) - 5,
          sparkline_in_7d: {
            price: Array.from({ length: 7 }, () => Math.random() * 1000 + 100)
          }
        }));

        setStockData(mockData);

        // Process chart data
        const chartDataObj: Record<string, ChartData> = {};
        const initialSelectedPoints: Record<string, number | null> = {};
        const initialHoveredPoints: Record<string, number | null> = {};

        const dateLabels = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        mockData.forEach(stock => {
          chartDataObj[stock.id] = {
            labels: dateLabels,
            prices: stock.sparkline_in_7d.price
          };

          initialSelectedPoints[stock.id] = null;
          initialHoveredPoints[stock.id] = null;
        });

        setChartData(chartDataObj);
        setSelectedPoints(initialSelectedPoints);
        setHoveredPoints(initialHoveredPoints);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchStockData();
    const intervalId = setInterval(fetchStockData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const getStockName = (symbol: string): string => {
    const names: Record<string, string> = {
      'AAPL': 'Apple Inc.',
      'GOOGL': 'Alphabet Inc.',
      'MSFT': 'Microsoft Corp.',
      'AMZN': 'Amazon.com Inc.'
    };
    return names[symbol] || symbol;
  };

  // Rest of the component code is similar to CryptoTracker
  // Including chart rendering, tooltip handling, etc.
  // Just copying the same functionality but for stocks

  if (loading) {
    return <div className="stock-tracker loading">Loading stock data...</div>;
  }

  if (error) {
    return <div className="stock-tracker error">Error: {error}</div>;
  }


  return (
    <div className="stock-tracker">

      <h1>Stock Market</h1>

      <div className="stock-container">
        {stockData.map(stock => (
          <div key={stock.id} className="stock-card">
            <div className="stock-header">
              <div className="stock-logo">{stock.symbol}</div>
              <div className="stock-info">
                <h2>{stock.name}</h2>
                <p className="stock-symbol">{stock.symbol}</p>
              </div>
            </div>

            <div className="stock-price">
              <span className="price-value">${stock.current_price.toLocaleString()}</span>
              <span className={`price-change ${stock.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}>
                {stock.price_change_percentage_24h >= 0 ? '↑' : '↓'}
                {Math.abs(stock.price_change_percentage_24h).toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockTracker;