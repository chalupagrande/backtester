# Backtester

Backtester is a package that allows for quick algorithmic trading back-testing against real market data (currently delivered through Alapca).

## Packages

- **core** - All of the core backtesting logic
- **server**\* - A API server to interact with the core modules, (in case you don't want to write javascript, or if you want to deploy this as a service)
- **services** - Services written for specific Broker dealers. (Currently only includes Alpaca)
- **tools** - Tools and Utilities to support the other packages.

**\*Note:** The server is a work-in-progress and does not currently have all the functionality of the core modules.

## Getting Started

## Method 1 - docker-compose

Create a copy of `.env.example` in the root of the project and rename the copy to `.env`. Fill in your "API Key ID" and your "API Key Secret" that you can get from your Alpaca account. Then from the root of the project run these commands:

```
docker-compose build
docker-compose up
```

## Method 2 - Manual Build

### Install the dependencies

```
yarn install
```

### Create .env file for Alapca API Keys

Create a copy `.env.example` and rename the copy to `.env`. Fill in your "API Key ID" and your "API Key Secret" that you can get from your Alpaca account.

### Running Tests

```
yarn test
```

This will run a suite of tests, and ensure that your API keys are working. In addition, you can inspect the tests to ensure that all the core functionality is there.

### Methodology

The backtester assumes a couple things of your trading algorithm.

- The algorithm is responsible for triggering the processing of orders
- The algorithm is responsible for "tick"ing through time.
- The algorithm is responsible for placing orders

#### Possible Algorithm Testing Document

```
const opts = {
  start: '2021-01-01T00:00:00Z',
  end: '2021-03-31T23:59:59Z',
  cash: 1000,
  inc: 'DAY',
  portfolio: ['GME', 'TSLA'],
}

// create an instance of your algorithm tester
const Algo = new MyCoolTradingAlgorithmTester()

// backtester preparations
const BT = new BT()
const Alpaca = new AlpacaService(opts)
Alpaca.fetch()
const BT.prepare({
const id = BT.prepare({
    cash: opts.cash,
    portfolio: opts.portfolio,
    service: Alpaca,
  })

const MyStudy = BT.getStudy(id)

// get the length of the study
// given the time range (3 months) this number will be 62
const studyLength = Alpaca.length

// if the algorithm only requires 1 day of data to make predictions.
// iterate through each "tick" and process...
for(let i = 0; i < studyLength; i++){

  // get the data for the current tick
  const bars = MyStudy.get()

  // algorithm decides if it would like to place an order.
  const orders = Algo.process(bars)

  // if there are orders, place them in the study
  if(orders.length > 0) {
    orders.forEach(o => MyStudy.order(o))
  }

  // increment the tick and process the orders
  MyStudy.tick()
  MyStudy.process()
}
```

# API Documentation

Below is the low level API documentation for the classes.

## **Backtester**

The Backtester is the parent class that holds an set of 'Studies'.

**_NOTE: This should be replaced by some database solution in the future. For now all studies are kept in memory_**

### **_Properties_**

- **studies &lt;Object&gt;** - an Object where the keys are the IDs of the Studies and the value is the Study Object itself.

### **_Methods_**

- **constructor**
  - example:
  ```
  const BT = new Backtester()
  ```
- **prepare(options:&lt;Object&gt;)**

  - description:
    Prepares the study to run

  - arguments: options&lt;Object&gt;

    - **cash: &lt;Float&gt;** - the original amount of cash you would like your algorithm to have to work with.
    - **service: &lt;Service&gt;** - an instance of a Service object. This will be used by your study to fetch data
    - **portfolio: &lt;Array[&lt;String&gt;]&gt;** - an array of strings that represent symbols for the Study to watch

  - @returns: &lt;ID&gt; - the ID of the study. This will be needed to fetch the study in the future using `.getStudy`

  - example:

    ```
    // ...create Service called "Alpaca" (See Service section for details)...
    BT.prepare({cash: 1000, serivce: Alpaca, portfolio: ['GME', 'TSLA']})
    ```

- **getStudy(id: &lt;String&gt;)**

  - description: Gets the study for you
  - arguments:

    - **id: &lt;String&gt;** - The string that is the ID of the study you wish to retrieve.

  - @returns: &lt;Study&gt; - the Study object

  - example:
    ```
    BT.getStudy("_h2u7cbmy3")
    ```

## **Service**

A service is a class used to get the stock data (bars) from a Broker Dealer and cache that data. **A service should be extended to accomodate any specific fetching logic related to that service.** In this repo, there is an "AlapaService" (`/src/services/AlpacaService.js`) that extends this base class. The Alpaca service includes the custom logic for `fetching`, and `get`ing the relevant data related to the study. If you do not wish to use Alpaca, you can create your own extension of the service (with the same methods) to get the same results.

**_NOTE: This could eventually be replaced with a service that asynchronously calls the Broker Dealer to get the window of data. In these examples though, the bars are provided by fetching the entire "window" of time and then slicing the relevant pieces to run the algorithm._**

### **_Properties_**

- **timeframe: &lt;Array[&lt;DateTime&gt;]&gt;** - an array of the ISO Date Formatted start date and the end date that the study will take place in. Where [0] is the start, and [1] is the end

- **inc: &lt;String&gt;** - A string that represents the _increment_ or level of fidelity to fetch the BAR data from the service (in this case Alpaca). This could be "DAY", "MINUTE", "HOUR" -- or whatever values the particular Broker Dealer API calls for. (in the case of the Alpaca Service, this value should be "DAY")

- **portfolio: &lt;Array[&lt;String&gt;]&gt;** - an array of strings that represent symbols for the Study to watch

- **data: &lt;Object&gt;** - an object where the KEYs are the stock Symbol, and the values are an Array each individual BAR data for the increment

- **client: &lt;Object&gt;** - This is the actual client (in this case Alpaca) that will have an API for fetching BAR data. This client should be used in the `fetch` function

- **length: &lt;Int&gt;** - The number of data points returned for each symbol in the portfolio for the given timeframe.

### **_Methods_**

- **constructor (start:&lt;Int&gt;, end&lt;Int&gt;)**

  - description: creates a new Service
  - arguments
    - **start: &lt;Int&gt;** - an integer value representing the 'tick' or 'index' of the desired Bar data that can be found in the `this.data` cache (inclusive)
    - **end: &lt;Int&gt;** - an integer value representing the 'tick' or 'index' of the **last** desired Bar data that can be found in the `this.data` cache (exclusive)
    - **inc: &lt;String&gt;** - A string that represents the _increment_ or level of fidelity to fetch the BAR data from the service (in this case Alpaca). This could be "DAY", "MINUTE", "HOUR" -- or whatever values the particular Broker Dealer API calls for. (in the case of the Alpaca Service, this value should be "DAY")
    - **portfolio: &lt;Array[&lt;String&gt;]&gt;** - an array of strings that represent symbols for the Study to watch

- **get(start:&lt;Int&gt;, end&lt;Int&gt;)**

  - description: "gets" a array of Bars that correspond to a point in time or 'tick'. This could be an array with 1 value in it, or many bar data objects.

  \*\*NOTE: This method could be redefined for a specific service if you "caching" methods are different"

  - arguments:

    - **start: &lt;Int&gt;** - an integer value representing the 'tick' or 'index' of the desired Bar data that can be found in the `this.data` cache (inclusive)
    - **end: &lt;Int&gt;** - an integer value representing the 'tick' or 'index' of the **last** desired Bar data that can be found in the `this.data` cache (exclusive)

  - @returns: &lt;Array[&lt;Object&gt;]&gt; - of "bar data" returned from `this.client`

  - example

    ```
    // this code can be found in the Study class
    this.service.get(this.curTick, this.curTick + 1)
    // this will return an array with 1 item in it at the `this.curTick` index
    ```

- **fetch()**

  - description: This method should be redefined to accomodate for the specific broker dealers implementation of their historical BAR data. It should populate the `data` property of the service so it looks something like this: (Where GME is a stock symbol). It is also where you can format your Bar data to look something like the structure below. The rest of the core classes depend on a similar structure. For more information read the "assumptions" section of "Study".

    ```
    this.data = {
      GME [
            {
              "startEpochTime": 1611118800,
              "openPrice": 37.37,
              "highPrice": 41.1899,
              "lowPrice": 36.06,
              "closePrice": 39.12,
              "volume": 32647202
            },
            {...},
            ....
          ],
      SOME_OTHER_SYMBOL: [...],
    }
    ```

    This function will likely take advantage of the `client`, `portfolio`, `inc`, and `timeframe` properties of a service to achieve this.

## **Study**

Study is the bread and butter of the backtester. It keeps track of all your open and filled orders, cash, the tick (or time-interval), and your holdings. It is what you will use to most when authoring your algorithm to run your tests. It functions as a stand-in for the market.

### **_Assumptions_**

**Parts of this could require altering depending on your specific service. It assumes that your "BAR" data will be structured like this. If that is not the case, you will either need to reformat your data in the "Service" class or adjust this class to accomodate your specific data structure**

```
{
  "startEpochTime": 1611118800,
  "openPrice": 37.37,
  "highPrice": 41.1899,
  "lowPrice": 36.06,
  "closePrice": 39.12,
  "volume": 32647202
}
```

### **_Properties_**

- **id: &lt;ID&gt;** - ID that represents this study in the larger Backtester object. (this is used so multiple studies can run simultaneously and not collide)

- **originalCash: &lt;Float&gt;** - some positive float value that is the amount of cash that the study started out with

- **cash: &lt;Object&gt;** - the current amount of cash that the study has on hand, and is not tied up in assets/holdings. (BUYs subtract from cash, SELLs add to cash)

- **queue: &lt;Array[&lt;Order&gt;]&gt;** - an array of orders yet to be processed. This could include both MARKET and LIMIT orders, if the study has not been processed.

- **filledOrders: &lt;Array[&lt;Order&gt;]&gt;** - an array of filled orders.

- **curTick: &lt;Int&gt;** - an Integer value that represents a time interval or 1 `inc`(increment) on the "Service". This is used in lieu of a date, and is essentially just the index in the data array that the information from the "Service" will be sliced.

- **service: &lt;Service&gt;** - the Service class from which to fetch the data.

- **holdings: &lt;Object&gt;** - an object where the keys are the Symbols in the portfolio, and the value is the amount of shares that the study currently holds.

### **_Methods_**

- **constructor(&lt;Object&gt)**

  - description: creates a Study
  - arguments
    - options: &lt;Object&gt;
      - **id: &lt;ID&gt;** - ID that represents this study in the larger Backtester object. (this is used so multiple studies can run simultaneously and not collide)
      - **cash: &lt;Object&gt;** - the current amount of cash that the study has on hand, and is not tied up in assets/holdings. (BUYs subtract from cash, SELLs add to cash)
      - **service: &lt;Service&gt;** - the Service class from which to fetch the data.
      - **portfolio: &lt;Array[ &lt;String&gt;]&gt;** - an array of strings representing the symbols for the stocks you would like to test

- **get(start:&lt;Object&gt;(OPTIONAL), end:&lt;Object&gt;(OPTIONAL))**

  - description: Similar to `Service.get`, but with optional arguments. Returns an array of bar data from the service for each symbol in the portfolio. If a start tick is given, will give an array with 1 bar data object in it. If no arguments are passed, then will return the bar data for the `curTick` the study is in. If both `start` and `end` are passed, will bet all data between (including) the `start` and (excluding) the `end`

  - arguments:

    - **start: &lt;Int&gt;** - an integer value representing the 'tick' or 'index' of the desired Bar data that can be found in the `this.data` cache (inclusive)
    - **end: &lt;Int&gt;** - an integer value representing the 'tick' or 'index' of the **last** desired Bar data that can be found in the `this.data` cache (exclusive)

  - @returns: &lt;Array&gt; - of "bar data" returned from `this.service`

  - example:

    ```
    const data = MyStudy.get(0,2)
    console.log(data)
    // logs something like:
    // {
    //     "GME": [
    //              {
    //                  "startEpochTime": 1609390800,
    //                  "openPrice": 19.25,
    //                  "highPrice": 19.8,
    //                  "lowPrice": 18.8,
    //                  "closePrice": 18.81,
    //                  "volume": 5638288
    //              },
    //              {
    //                  "startEpochTime": 1609736400,
    //                  "openPrice": 19,
    //                  "highPrice": 19.1,
    //                  "lowPrice": 17.15,
    //                  "closePrice": 17.24,
    //                  "volume": 9753598
    //              },
    //            ],
    //      "TSLA": [
    //                {
    //                  "startEpochTime": 1609390800,
    //                  "openPrice": 699.99,
    //                  "highPrice": 718.72,
    //                  "lowPrice": 691.12,
    //                  "closePrice": 705.21,
    //                  "volume": 48019909
    //                },
    //                {
    //                  "startEpochTime": 1609736400,
    //                  "openPrice": 719.46,
    //                  "highPrice": 744.4899,
    //                  "lowPrice": 717.1895,
    //                  "closePrice": 729.75,
    //                  "volume": 45293360
    //                },
    //              ]
    //  }
    //
    ```

- **tick()**

  - description: Increments `this.curTick`
  - @returns: &lt;Int&gt; - the integer value of the current tick
  - example:
    ```
    const t = MyStudy.tick()
    console.log(t === MyStudy.curTick) // true
    ```

- **order(&lt;Object&gt)**

  - description: Places an order in the `Study.queue` to be processed.
  - arguments:

    - options: &lt;Object&gt;
      - **symbol: &lt;String&gt;** - string representing the Stock symbol. (eg. 'TSLA')
      - **direction: &lt;'BUY' | 'SELL'&gt;** - a String (ENUM) that is either 'BUY' or 'SELL'
      - **type: &lt;'MARKET' | 'LIMIT'&gt;** - a String (ENUM) that is either 'MARKET' or 'LIMIT' that represents the type of order to place. Limit orders will not be placed until the stock price has been reached. Market will be placed at the next processing at the average between the open and close prices for that tick.
      - **shares: &lt;Int&gt;** - the number of shares you would like to trade
      - **price: &lt;Float&gt;** (OPTIONAL) - the price you would like the limit order to be placed at. Ignored for MARKET orders.
      - **name: &lt;String&gt;** (OPTIONAL) - optional name string to give an order.

  - @returns: &lt;Order&gt; - The order object.

  - example:
    ```
    const order = MyStudy.order({
      symbol: 'TSLA',
      direction: 'BUY',
      type: 'LIMIT',
      shares: 10,
      price: 170 // only needed if LIMIT order
    })
    ```

- **process()**

  - description: Iterates over the queue of orders and processes the ones that should have been filled given the current tick data values. Will move orders that are being filled into `this.filledOrders` array.

  - @returns: &lt;Array[&lt;Orders&gt;]&gt; - An array of orders that were filled during the processing. If no orders were filled, returns an empty array.

  - example:
    ```
    const filledOrders = MyStudy.process()
    const anOrderFilled = filledOrders.length > 0
    ```

## **Order**

This is the low level Order object. This keeps track of the `value`, `price`... and other properties of an order.

### **_Properties_**

- **id: &lt;String&gt;** - ID
- **name: &lt;String&gt;** - optional Name string to describe the order.
- **placedAt: &lt;Int&gt;** - the tick value the order was placed at
- **filledAt: &lt;Order&gt;** - the tick value the order was filled at, or null if the order has not been filled.
- **symbol: &lt;String&gt;** - string value for the stock symbol
- **direction: &lt;BUY | SELL&gt;** - string value for 'BUY' or 'SELL'
- **type: &lt;MARKET | LIMIT&gt;** - string value for 'MARKET' or 'LIMIT
- **shares: &lt;Int&gt;** - number for the number of shares to buy of that stock symbol
- **price: &lt;Float&gt;** - number for the price to execute the order at.
- **status: &lt;PENDING | COMPLETED&gt;** - status of the order
- **value: &lt;Float&gt;** - the value to add to the cash balance once the order is filled. For BUYs that value is negative. For SELLs the value is positive.

### **_Methods_**

- **constructor(&lt;Object&gt)**

  - description: Creates an order
  - arguments
    - options: &lt;Object&gt;
      - **placedAt: &lt;Int&gt;** - the tick value the order was placed at
      - **symbol: &lt;String&gt;** - string value for the stock symbol
      - **direction: &lt;BUY | SELL&gt;** - string value for 'BUY' or 'SELL'
      - **type: &lt;MARKET | LIMIT&gt;** - string value for 'MARKET' or 'LIMIT
      - **shares: &lt;Int&gt;** - number for the number of shares to buy ofthat stock symbol
      - **price: &lt;Float&gt;** - number for the price to execute the order at.
      - **status: &lt;PENDING | COMPLETED&gt;** - status of the order

- **execute(tick: &lt;Int&gt;)**

  - description: Changes the status to "COMPLTETED", updates the `filledAt`, to the tick, and returns the value
  - arguments:

    - tick: &lt;Int&gt; - The tick value to set as the `filledAt` value

  - @returns: &lt;Float&gt; - the value of the order.

  - example:
    ```
    const delta = MyOrder.execute()
    const isSellOrder = delta > 0
    ```
