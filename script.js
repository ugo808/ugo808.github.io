// Mobile menu handling
const hamburger = document.querySelector('.hamburger');
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.nav-links a');

// Toggle mobile menu
function toggleMenu() {
    hamburger.classList.toggle('active');
    navbar.classList.toggle('active');
    // Update aria-expanded
    const isExpanded = hamburger.classList.contains('active');
    hamburger.setAttribute('aria-expanded', isExpanded);
    // Prevent body scroll when menu is open
    document.body.style.overflow = isExpanded ? 'hidden' : '';
}

// Add click handlers
if (hamburger && navbar) {
    hamburger.addEventListener('click', toggleMenu);
    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbar.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
}

// Close menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navbar.classList.contains('active')) {
        toggleMenu();
    }
});

const _getStarted = document.querySelector('.get-started');
if (_getStarted) {
    _getStarted.addEventListener('click', function() {
        alert('Get Started clicked! This will take you to the next step.');
    });
}

const _watchVideo = document.querySelector('.watch-video');
if (_watchVideo) {
    _watchVideo.addEventListener('click', function() {
        alert('Watch Video clicked! This will play a demo video.');
    });
}




// Add wallet status message to header
let walletStatus = document.getElementById('walletStatus');
if (!walletStatus) {
    walletStatus = document.createElement('div');
    walletStatus.id = 'walletStatus';
    walletStatus.style.cssText = 'color:#00ff95;font-size:0.95rem;margin-left:16px;display:inline-block;vertical-align:middle;';
    document.querySelector('header nav').appendChild(walletStatus);
}

// Function to connect to MetaMask with UI feedback
async function connectToMetaMask() {
    walletStatus.textContent = '';
    if (typeof window.ethereum !== 'undefined') {
        try {
            walletStatus.textContent = 'Connecting...';
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const walletAddress = accounts[0];
            walletStatus.textContent = 'Connected: ' + walletAddress.slice(0,6) + '...' + walletAddress.slice(-4);
            // Optionally, update button text
            // document.querySelector('.connect-wallet').textContent = walletAddress.slice(0,6) + '...' + walletAddress.slice(-4);
            return walletAddress;
        } catch (err) {
            walletStatus.textContent = 'Connection rejected or failed.';
            console.error('MetaMask connection error:', err);
            return null;
        }
    } else {
        walletStatus.textContent = 'MetaMask not installed.';
        console.error('MetaMask or another Ethereum wallet is not installed.');
        return null;
    }
}

const _connectBtn = document.querySelector('.connect-wallet');
if (_connectBtn) {
    _connectBtn.addEventListener('click', connectToMetaMask);
}

// Get DOM elements for chat (guarded)
const chatToggle = document.querySelector('.chat-bot-toggle');
const chatContainer = document.querySelector('#chatBot');
const closeChat = document.querySelector('.close-chat');
const chatMessages = document.querySelector('#chatMessages');
const chatInput = document.querySelector('#chatInput');
const sendMessage = document.querySelector('#sendMessage');

if (chatToggle && chatContainer) {
    chatToggle.addEventListener('click', () => chatContainer.classList.add('active'));
}
if (closeChat && chatContainer) {
    closeChat.addEventListener('click', () => chatContainer.classList.remove('active'));
}
if (sendMessage && chatInput && chatMessages) {
    sendMessage.addEventListener('click', () => {
        const userMessage = chatInput.value.trim();
        if (userMessage) {
            addMessage('You: ' + userMessage, 'user-message');
            const botResponse = getBotResponse(userMessage);
            addMessage('Bosa Bot: ' + botResponse, 'bot-message');
            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });
}

// Add message to chat
function addMessage(message, className) {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.classList.add(className);
    chatMessages.appendChild(messageElement);
}

// Simple bot response logic
function getBotResponse(userMessage) {
    userMessage = userMessage.toLowerCase();
    if (userMessage.includes('hello') || userMessage.includes('hi')) {
        return 'Hello! How can I assist you today?';
    } else if (userMessage.includes('crypto') || userMessage.includes('marketplace')) {
        return 'This is a smart crypto marketplace where you can trade securely!';
    } else if (userMessage.includes('help')) {
        return 'I can help with crypto info. Ask me about crypto or the marketplace!';
    } else {
        return 'Sorry, I didn’t understand. Try asking about crypto or help!';
    }
}


if (chatInput && sendMessage) {
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage.click();
    });
}

// Crypto prices & chart removed — chart code and Chart.js loader were removed

// --- Price ticker: fetch prices and populate ticker ---
function fetchTickerPrices() {
    const ids = ['bitcoin','ethereum','binancecoin','solana','ripple','cardano','dogecoin','tron','polygon','polkadot','litecoin'];
    const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=' + ids.join(',') + '&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h';

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const inner = document.getElementById('priceTickerInner');
            if (!inner) return;
            // build items string in the order of ids array
            let items = ids.map(id => {
                const coin = (data || []).find(c => c.id === id);
                const name = coin ? coin.name : (id === 'binancecoin' ? 'BNB' : (id === 'ripple' ? 'XRP' : (id === 'polkadot' ? 'DOT' : id.charAt(0).toUpperCase() + id.slice(1))));
                const symbol = coin && coin.symbol ? coin.symbol.toUpperCase() : (name.match(/[A-Z]{2,}|[A-Z]/g) || [name]).slice(0,1)[0];
                const price = coin && (coin.current_price !== undefined && coin.current_price !== null) ? Number(coin.current_price).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : '—';
                // try to use 24h change if available
                const changeVal = coin && (coin.price_change_percentage_24h !== undefined && coin.price_change_percentage_24h !== null) ? Number(coin.price_change_percentage_24h) : null;
                let changeHtml = '';
                if (changeVal !== null) {
                    const formatted = changeVal.toFixed(2);
                    const sign = changeVal > 0 ? '+' : '';
                    const cls = changeVal > 0 ? 'price-up' : (changeVal < 0 ? 'price-down' : 'price-neutral');
                    changeHtml = ` <span class="change ${cls}">(${sign}${formatted}%)</span>`;
                }
                return `<span class="price-ticker__item"><span class="symbol">${symbol}</span><span class="pair">${name}</span><span class="price">$${price}</span>${changeHtml}</span>`;
            }).join('');

            // Duplicate content so animation loop is smooth
            inner.innerHTML = items + items;
        })
        .catch(err => {
            const inner = document.getElementById('priceTickerInner');
            if (inner) inner.textContent = 'Failed to load ticker.';
            console.error('Ticker fetch error', err);
        });
}

// initial fetch and periodic refresh
fetchTickerPrices();
setInterval(fetchTickerPrices, 60 * 1000); // refresh every 60s
// Crypto prices and chart code removed per request (no fetchCryptoPrices, no chart rendering)
// Get reference to news grid
const newsGrid = document.getElementById('newsGrid');

// Fetch and display crypto news
function fetchCryptoNews() {
    // Show loading state
    newsGrid.innerHTML = '<div class="news-loading">Loading latest crypto news...</div>';

    // Using CryptoCompare News API (no API key required for basic usage)
    fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN')
        .then(response => response.json())
        .then(data => {
            if (data.Data && data.Data.length > 0) {
                newsGrid.innerHTML = '';
                // Take first 20 news items
                data.Data.slice(0, 20).forEach(news => {
                    const newsItem = document.createElement('div');
                    newsItem.className = 'news-item';
                    // Format the news content with title and full description
                    newsItem.innerHTML = `
                        <strong>${news.title}</strong>
                        <p>${news.body}</p>
                    `;
                    newsGrid.appendChild(newsItem);
                });
            } else {
                newsGrid.innerHTML = '<div class="news-loading">No news available at the moment.</div>';
            }
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            newsGrid.innerHTML = '<div class="news-loading">Unable to load news. Please try again later.</div>';
        });
}

// Initial news load
fetchCryptoNews();

// Refresh news every 5 minutes
setInterval(fetchCryptoNews, 5 * 60 * 1000);

