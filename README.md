# Rideshare

A phone app (iPhone and Android) that compares estimated ride costs across Uber, Lyft and taxis. Starting with Edmonton.

## Run it

1. Install [Node.js](https://nodejs.org) (version 20 or newer).
2. Install the **Expo Go** app on your phone (App Store or Google Play).
3. In this folder:

   ```bash
   npm install
   npm start
   ```

4. Scan the QR code from the terminal with your phone camera (iPhone) or the Expo Go app (Android).

## Plan

1. Set up the Expo app (done)
2. Edmonton fare estimator (done): `src/fares/`
3. Comparison screen: pickup and drop-off, estimates sorted by price, buttons to open each app
4. Test builds for friends (TestFlight and an Android test link)

## Fare estimates

`src/fares/rates.ts` holds the fare rules for each service, and `src/fares/estimate.ts` turns a trip's driving distance and time into a price range, cheapest first. Run the tests with `npm test`.

- **Taxi** rates are official, from the City of Edmonton [Vehicle for Hire Bylaw 17400](https://webdocs.edmonton.ca/bylaws/17400-Vehicle-for-Hire-Bylaw-C-20250401.pdf): $4.10 for the first 135 m, $0.25 per further 135 m, $30/hour waiting, plus the City's 13.29% fuel surcharge.
- **Uber and Lyft** don't publish Edmonton rate cards, so their numbers are starting estimates. To tune them, request quotes in each app for a few trips of different lengths (without booking), note the price, distance and time, and adjust the values in `rates.ts`.

Prices shown are estimates. Real fares vary with surge pricing, traffic and route.
