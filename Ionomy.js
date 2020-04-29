/* eslint-disable class-methods-use-this */
const axios = require('axios').default;
const crypto = require('crypto');
const https = require('https');

class Ionomy {
  /**
   * @constructor
   * @param {Object} options - API configs
   * @param {String} options.api - Ionomy API base URL
   * @param {String} options.apiKey - Ionomy API key
   * @param {String} options.apiSecret - Ionomy API secret
   * @param {Boolean} options.keepAlive
   */
  constructor({
    api = null, apiKey = null, apiSecret = null, keepAlive = true,
  } = {}) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;

    this.client = axios.create({
      baseURL: (api) || 'https://ionomy.com/api/v1/',
      httpsAgent: new https.Agent({ keepAlive }),
    });
  }

  requestSignature(path, params, timestamp) {
    const query = new URLSearchParams(params).toString();
    const url = `${this.client.defaults.baseURL}${path}${(query) ? `?${query}` : ''}`;
    const hmac = crypto.createHmac('sha512', this.apiSecret);
    return hmac.update(url + timestamp).digest('hex');
  }

  sanitizeParams(params = {}) {
    const obj = {};

    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined) obj[key] = params[key];
    });

    return obj;
  }

  async request(endpoint, params = {}) {
    let headers = {};
    // eslint-disable-next-line no-param-reassign
    params = this.sanitizeParams(params);

    if (this.apiKey && this.apiSecret) {
      const timestamp = Math.floor(new Date() / 1000);
      const hmac = this.requestSignature(endpoint, params, timestamp);

      headers = {
        'api-auth-time': timestamp,
        'api-auth-key': this.apiKey,
        'api-auth-token': hmac,
      };
    }

    const { data } = await this.client.get(`${endpoint}`, { params, headers });

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data;
  }

  // PUBLIC

  /**
   * Returns all available markets
   * @return {Promise}
   */
  markets() {
    return this.request('public/markets');
  }

  /**
   * Returns available currencies
   */
  currencies() {
    return this.request('public/currencies');
  }

  /**
   * Returns order book
   * @param {Object} options - Order book options
   * @param  {String} options.market - Market name
   * @param  {String} options.type - Order type. Can be one of `ask`, `bid`, `both`
   */
  orderBook({ market, type = 'both' }) {
    if (!market) throw new Error('market is required');
    if (!['ask', 'bid', 'both'].includes(type)) throw new Error('type must be one of: asks, bids, both');

    return this.request('public/orderbook', { market, type });
  }

  /**
   * Returns market summaries
   */
  marketSummaries() {
    return this.request('public/markets-summaries');
  }

  /**
   * Returns market summary of the provided market
   * @param {String} market - Market name
   */
  marketSummary(market) {
    if (!market) throw new Error('market is required');

    return this.request('public/market-summary', { market });
  }

  /**
   * Returns market history of the provided market
   * @param {String} market - Market name
   */
  marketHistory(market) {
    if (!market) throw new Error('market is required');

    return this.request('public/market-history', { market });
  }

  // MARKET

  /**
   * Places a limit buy order
   * @param {Object} options - Buy order options
   * @param {String} options.market - An unique identifier of the market. Example: `btc-hive`
   * @param {Number|String} options.amount - Amount to buy. Example: `1.00`
   * @param {Number|String} options.price - Price. Example: `1.00`
   * @return {Promise<JSON>} orderId
   */
  limitBuy({ market, amount, price }) {
    if (!market) throw new Error('market is required');
    if (!amount) throw new Error('amount is required');
    if (!price) throw new Error('price is required');

    const params = {
      market,
      amount: parseFloat(amount).toFixed(8),
      price: parseFloat(price).toFixed(8),
    };

    return this.request('market/buy-limit', params);
  }

  /**
   * Places a limit sell order
   * @param {Object} options - Sell order options
   * @param {String} options.market - An unique identifier of the market. Example: `btc-hive`
   * @param {Number|String} options.amount - Amount to sell. Example: `1.00`
   * @param {Number|String} options.price - Price. Example: `1.00`
   * @return {Promise<JSON>} orderId
   */
  limitSell({ market, amount, price }) {
    if (!market) throw new Error('market is required');
    if (!amount) throw new Error('amount is required');
    if (!price) throw new Error('price is required');

    const params = {
      market,
      amount: parseFloat(amount).toFixed(8),
      price: parseFloat(price).toFixed(8),
    };

    return this.request('market/sell-limit', params);
  }

  /**
   * Cancels an order
   * @param {String} orderId - An unique order ID. Example: `5b8e8c980e454f2b807863ee`
   * @return {Promise}
   */
  cancelOrder(orderId) {
    if (!orderId) throw new Error('orderId is required');

    return this.request('market/cancel-order', { orderId });
  }

  /**
   * Fetches open orders for a market
   * @param {String} market - An unique identifier of the market. Example: `btc-hive`
   * @return {Promise<JSON>}
   */
  openOrders(market) {
    if (!market) throw new Error('market is required');

    return this.request('market/open-orders', { market });
  }

  // ACCOUNT

  /**
   * Fetches all balances for the account
   * @return {Promise<JSON>}
   */
  balances() {
    return this.request('account/balances');
  }

  /**
   * Fetches balance for the specified currency
   * @param {String} currency - An unique identifier of the currency. Example - `hive`
   * @return {Promise<JSON>}
   */
  balance(currency) {
    if (!currency) throw new Error('currency is required');

    return this.request('account/balance', { currency });
  }

  /**
   * Fetches deposit address for the specified currency
   * @param {String} currency - An unique identifier of the currency. Example - `hive`
   * @return {Promise<JSON>}
   */
  depositAddress(currency) {
    if (!currency) throw new Error('currency is required');

    return this.request('account/deposit-address', { currency });
  }

  /**
   * Fetches deposit history for the specified currency
   * @param {String} currency - An unique identifier of the currency. Example - `hive`
   * @return {Promise<JSON>}
   */
  depositHistory(currency) {
    if (!currency) throw new Error('currency is required');

    return this.request('account/deposit-history', { currency });
  }

  /**
   * Places a withdrawal request
   * @param {Object} options - Withdrawal options
   * @param {String} options.currency - An unique identifier of the currency. Example - `hive`
   * @param {Number|String} options.amount - Amount to withdraw. Example: `1.00`
   * @param {String} options.address - Wallet address. Example: `7ea4b0cb402320effd4309683290fdc5`
   * @return {Promise<JSON>}
   */
  withdraw({ currency, amount, address }) {
    if (!currency) throw new Error('currency is required');
    if (!amount) throw new Error('amount is required');
    if (!address) throw new Error('address is required');

    const params = {
      currency,
      amount: parseFloat(amount).toFixed(8),
      address,
    };

    return this.request('account/withdraw', params);
  }

  /**
   * Fetches withdrawal history for the specified currency
   * @param {String} currency - An unique identifier of the currency. Example - `hive`
   * @return {Promise<JSON>}
   */
  withdrawalHistory(currency) {
    if (!currency) throw new Error('currency is required');

    return this.request('account/withdrawal-history', { currency });
  }

  /**
   * Fetches order status
   * @param {String} orderId - An unique order ID. Example: `5b8e8c980e454f2b807863ee`
   * @return {Promise<JSON>}
   */
  order(orderId) {
    if (!orderId) throw new Error('orderId is required');

    return this.request('account/order', { orderId });
  }

  /**
   * Fetches order history for the specified currency
   * @param {String} market - An unique identifier of the market. Example: `btc-hive`
   * @return {Promise<JSON>}
   */
  orderHistory(market) {
    if (!market) throw new Error('market is required');

    return this.request('account/order-history', { market });
  }
}

module.exports = Ionomy;
