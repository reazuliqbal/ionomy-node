# ionomy-node

Ionomy API client for Node.js

## Usage

Get you api key and secret from https://ionomy.com/en/account/api.

### Initialize Client

```js
const Ionomy = require('ionomy-node');

const client = new Ionomy({
  apiKey: 'abcdapikey',
  apiSecret: 'abcdapisecret',
});
```

### Public Methods

```js
await client.markets();
await client.currencies();
await client.orderBook({ market: 'btc-hive', type: 'both' });
await client.marketSummaries();
await client.marketSummary('btc-hive');
await client.marketHistory('btc-hive');
```

#### Market Methods

```js
await client.limitBuy({ market: 'btc-hive', amount: '100', price: '0.00005' });
await client.limitSell({ market: 'btc-hive', amount: '100', price: '0.00005' });
await client.cancelOrder('5b8e8c980e454f2b807863ee');
await client.openOrders('btc-hive');
```
#### Account Methods

```js
await client.balances();
await client.balance('hive');
await client.depositAddress('hive');
await client.depositHistory('hive');
await client.withdraw({ currency: 'hive', amount: '100', address: 'reazuliqbal' });
await client.withdrawalHistory('hive');
await client.order('5b8e8c980e454f2b807863ee');
await client.orderHistory('btc-hive');
```
