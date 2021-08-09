# Open Questions

- What is the `Backtester`?
  - How/Why would we connect it to a database
  - what would we store in the DB

## Ramblings

- The client should be able to run and analyze studies with different parameters. This way, on the client you can browse algorithms, and change inputs. to run different studies.
- Algorithms should take a predefined form, dictating their parameters.
  - Some common parameters would be [symbol, timeframe]

## TODO

- [x] Write tests such that they are independent. and dont depend on the outcome of the previous tests.
- [ ] Write a Logging service that could Chart and Output CSV of logs from the algorithm for debugging.
- [ ] Adjust Service so if a service cannot give the data for the whole window, it will chunk it and eventually fetch all the data.
- [ ] Add a Kraken service
- [x] Add a fetchBidAsk to services that gets raw BidAsk data
- [ ] In the client, be able to plot technical indicators
  - Or provide a separate plotting service that can make marks on the graph
