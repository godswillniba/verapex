import React, { useState, useEffect, useRef } from 'react';
import './CryptoTracker.css';

// Define types for our cryptocurrency data
interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
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
  cryptoId: string;
}

const CryptoTracker: React.FC = () => {
  // State for storing cryptocurrency data
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
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
    cryptoId: ''
  });
  const [selectedPoints, setSelectedPoints] = useState<Record<string, number | null>>({});
  const [hoveredPoints, setHoveredPoints] = useState<Record<string, number | null>>({});
  const chartRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // List of cryptocurrencies to track
  const cryptoIds = ['bitcoin', 'ethereum', 'solana', 'pi-network-iou']; // Pi Network as IOU on CoinGecko

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        // Fetch basic crypto data
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptoIds.join(',')}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch cryptocurrency data');
        }

        const data: CryptoData[] = await response.json();
        setCryptoData(data);

        // Process chart data for each cryptocurrency
        const chartDataObj: Record<string, ChartData> = {};
        const initialSelectedPoints: Record<string, number | null> = {};
        const initialHoveredPoints: Record<string, number | null> = {};

        // Generate labels for 7 days (today and 6 days prior)
        const dateLabels = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        data.forEach(crypto => {
          if (crypto.sparkline_in_7d && crypto.sparkline_in_7d.price) {
            // Take 7 evenly spaced points from the sparkline data
            const prices = [];
            const priceData = crypto.sparkline_in_7d.price;
            const step = Math.floor(priceData.length / 7);

            for (let i = 0; i < 7; i++) {
              prices.push(priceData[i * step]);
            }

            chartDataObj[crypto.id] = {
              labels: dateLabels,
              prices
            };

            initialSelectedPoints[crypto.id] = null;
            initialHoveredPoints[crypto.id] = null;
          }
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

    fetchCryptoData();

    // Set up interval for live updates (every 1 minute)
    const intervalId = setInterval(fetchCryptoData, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Handle window resize for tooltip positioning
  useEffect(() => {
    const handleResize = () => {
      if (tooltipData.visible) {
        updateTooltipPosition(tooltipData.cryptoId, hoveredPoints[tooltipData.cryptoId] || 0);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [tooltipData, hoveredPoints]);

  const updateTooltipPosition = (cryptoId: string, index: number) => {
    const chartElement = chartRefs.current[cryptoId];
    if (!chartElement) return;

    const chartRect = chartElement.getBoundingClientRect();
    const data = chartData[cryptoId];
    if (!data) return;

    const priceData = data.prices[index];
    const dateData = data.labels[index];
    const priceChange = ((priceData - data.prices[0]) / data.prices[0] * 100).toFixed(2);

    // Calculate x position based on index
    const width = chartRect.width;
    const x = (index / (data.prices.length - 1)) * width;

    // Calculate tooltip position with edge detection
    const tooltipWidth = 120; // Approximate width of tooltip
    let tooltipX = x;

    // Adjust if too close to left edge
    if (tooltipX < tooltipWidth / 2) {
      tooltipX = 0;
    } 
    // Adjust if too close to right edge
    else if (tooltipX > width - tooltipWidth / 2) {
      tooltipX = width - tooltipWidth;
    } 
    // Center tooltip on point
    else {
      tooltipX = tooltipX - (tooltipWidth / 2);
    }

    setTooltipData({
      visible: true,
      x: tooltipX,
      y: 0, // Top of the chart container
      price: priceData,
      date: dateData,
      change: `${priceChange}%`,
      cryptoId
    });
  };

  // Function to render the price chart for a cryptocurrency
  const renderChart = (id: string) => {
    const data = chartData[id];
    if (!data) return null;

    const max = Math.max(...data.prices);
    const min = Math.min(...data.prices);
    const range = max - min;

    // Normalize prices to fit in the chart height
    const normalizedPrices = data.prices.map(price => 
      100 - ((price - min) / range) * 80
    );

    // Create SVG path
    const points = normalizedPrices.map((price, index) => 
      `${(index * (100 / (normalizedPrices.length - 1))).toFixed(2)},${price.toFixed(2)}`
    ).join(' ');

    const priceChange = data.prices[data.prices.length - 1] - data.prices[0];
    const lineColor = priceChange >= 0 ? '#00ff9d' : '#ff4343';

    const handleMouseMove = (event: React.MouseEvent<SVGElement>, index: number) => {
      setHoveredPoints(prev => ({ ...prev, [id]: index }));
      updateTooltipPosition(id, index);
    };

    const handleChartMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
      if (selectedPoints[id] !== null) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const chartWidth = rect.width;

      // Determine closest point index based on x position
      const pointWidth = chartWidth / (data.prices.length - 1);
      const index = Math.min(
        Math.max(0, Math.round(x / pointWidth)),
        data.prices.length - 1
      );

      setHoveredPoints(prev => ({ ...prev, [id]: index }));
      updateTooltipPosition(id, index);
    };

    const handleMouseLeave = () => {
      if (selectedPoints[id] === null) {
        setTooltipData(prev => ({ ...prev, visible: false }));
        setHoveredPoints(prev => ({ ...prev, [id]: null }));
      }
    };

    const handlePointClick = (index: number) => {
      // Toggle selection
      setSelectedPoints(prev => ({
        ...prev,
        [id]: prev[id] === index ? null : index
      }));

      if (selectedPoints[id] !== index) {
        updateTooltipPosition(id, index);
      }
    };

    return (
      <div 
        className="chart-container" 
        ref={el => chartRefs.current[id] = el}
      >
        <svg 
          viewBox="0 0 100 100" 
          className="chart"
          style={{ cursor: 'crosshair' }}
          onMouseMove={handleChartMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area fill under the line */}
          <path
            d={`M0,${normalizedPrices[0]} ${points} ${(normalizedPrices.length - 1) * (100 / (normalizedPrices.length - 1))},100 0,100 Z`}
            fill={`url(#gradient-${id})`}
            fillOpacity="0.2"
          />

          {/* Line path */}
          <polyline
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
            points={points}
          />

          {/* Data points */}
          {normalizedPrices.map((price, index) => {
            const isSelected = selectedPoints[id] === index;
            const isHovered = hoveredPoints[id] === index && !isSelected;
            const pointSize = isSelected ? 4 : isHovered ? 3 : 1.5;

            return (
              <circle
                key={index}
                cx={(index * (100 / (normalizedPrices.length - 1))).toFixed(2)}
                cy={price.toFixed(2)}
                r={pointSize}
                fill={lineColor}
                stroke={isSelected || isHovered ? "#ffffff" : lineColor}
                strokeWidth={isSelected || isHovered ? 1 : 0}
                onMouseMove={(e) => handleMouseMove(e, index)}
                onClick={() => handlePointClick(index)}
                className={isSelected ? 'selected' : isHovered ? 'hovered' : ''}
              />
            );
          })}
        </svg>

        {tooltipData.visible && tooltipData.cryptoId === id && (
          <div 
            className="price-tooltip visible"
            style={{ 
              left: `${tooltipData.x}px`, 
              top: 0,
              transform: 'translateY(-100%)'
            }}
          >
            <div><strong>${tooltipData.price.toLocaleString()}</strong></div>
            <div>{tooltipData.date}</div>
            <div className={tooltipData.change.startsWith('-') ? 'negative' : 'positive'}>
              {tooltipData.change}
            </div>
          </div>
        )}

        <div className="chart-labels">
          {data.labels.map((label, index) => (
            <div 
              key={index} 
              className={`chart-label ${
                (hoveredPoints[id] === index || selectedPoints[id] === index) ? 'active' : ''
              }`}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Get the appropriate logo for each cryptocurrency
  const getCryptoLogo = (id: string) => {
    switch (id) {
      case 'bitcoin':
        return '₿';
      case 'ethereum':
        return 'Ξ';
      case 'solana':
        return 'SOL';
      case 'pi-network-iou':
        return 'π';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="crypto-tracker loading">Loading cryptocurrency data...</div>;
  }

  if (error) {
    return <div className="crypto-tracker error">Error: {error}</div>;
  }

  return (
    <div className="crypto-tracker">
      <h1>Cryptocurrency Tracker</h1>
      <div className="crypto-container">
        {cryptoData.map(crypto => (
          <div key={crypto.id} className="crypto-card">
            <div className="crypto-header">
              <div className="crypto-logo">{getCryptoLogo(crypto.id)}</div>
              <div className="crypto-info">
                <h2>{crypto.name}</h2>
                <p className="crypto-symbol">{crypto.symbol.toUpperCase()}</p>
              </div>
            </div>

            <div className="crypto-price">
              <span className="price-value">${crypto.current_price.toLocaleString()}</span>
              <span className={`price-change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}>
                {crypto.price_change_percentage_24h >= 0 ? '↑' : '↓'}
                {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
              </span>
            </div>

            {renderChart(crypto.id)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoTracker;