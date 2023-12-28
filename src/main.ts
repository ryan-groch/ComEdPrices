import z from "zod"
import { getClient } from '@tauri-apps/api/http';

const schema = z.object({
  millisUTC: z.string(),
  price: z.string()
}).array().nonempty();

const inPrevHour = (now: Date, check: Date) => 
    (now.getHours() === 0 
      ? check.getHours() === 23 
      : check.getHours() === now.getHours() - 1);

const inCurrOrPrevHour = (now: Date, check: Date) => 
    // Valid date
    !isNaN(+check)
    // Hours are the same
    && ((now.getHours() === check.getHours())
        // Hours are different and minutes aren't 0
        || inPrevHour(now, check));

const oneMinute = 60*1000;
const fiveMinutes = 5 * oneMinute;

const currHourUrl = "https://hourlypricing.comed.com/api?type=currenthouraverage";
const fiveMinutesUrl = "https://hourlypricing.comed.com/api?type=5minutefeed";

window.addEventListener("DOMContentLoaded", () => {
  const fiveMinutesElem = document.querySelector("#five-minutes");
  const currHourElem = document.querySelector("#curr-hour");
  const prevHourElem = document.querySelector("#prev-hour");

  const timestampedElem = document.querySelector("#timestamped");
  const fetchedElem = document.querySelector("#fetched");

  const btnElem = document.querySelector("#btn");

  if (!fiveMinutesElem || !currHourElem || !prevHourElem 
      || !timestampedElem || !fetchedElem || !btnElem) 
    return;
    
  let lastFetched: Date | null = null;

  const setError = () => {
    fiveMinutesElem.textContent = prevHourElem.textContent = currHourElem.textContent = "Error";
  }
  
  const fetchData = async () => {
    const client = await getClient();
    const currHourFetch = schema.safeParse((await client.get(currHourUrl)).data);
    const fiveMinuteFetch = schema.safeParse((await client.get(fiveMinutesUrl)).data);

    if (!currHourFetch.success || !fiveMinuteFetch.success) {
      setError();
      return;
    }
    
    // Set curr hour
    const currHourVal = Number(currHourFetch.data[0].price);
    currHourElem.textContent = `${currHourVal.toFixed(1)}¢`;

    // Set five minutes
    const fiveMinVal = Number(fiveMinuteFetch.data[0].price);
    fiveMinutesElem.textContent = `${fiveMinVal.toFixed(1)}¢`;

    const lastTimestamp = new Date(Number(fiveMinuteFetch.data[0].millisUTC));

    // Calculate and set prev hour
    let valsUsed = 0;
    let total = 0;
    let indexDate: Date | null = new Date(lastTimestamp);

    for (const snapshot of fiveMinuteFetch.data) {
      indexDate.setTime(Number(snapshot.millisUTC));
      if (!inCurrOrPrevHour(lastTimestamp, indexDate)) {
        break;
      }
      
      if (inPrevHour(lastTimestamp, indexDate)) {
        total += Number(snapshot.price);
        valsUsed++;
      }
    }

    const avg = total / valsUsed;
    prevHourElem.textContent = `${avg.toFixed(1)}¢`;

    // Update timestamps fetched and timestamp
    lastFetched = new Date();
    timestampedElem.textContent = lastTimestamp.toLocaleTimeString();
    fetchedElem.textContent = lastFetched.toLocaleTimeString();
  }

  const fetchDataAuto = () => {
    if (lastFetched !== null && 
      new Date().getTime() - lastFetched?.getTime() < fiveMinutes) 
      return;
    
    fetchData();
  }

  btnElem.addEventListener("click", fetchData);
  setInterval(fetchDataAuto, oneMinute);
  fetchDataAuto();
});
