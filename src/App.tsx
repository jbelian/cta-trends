// App.tsx

import React, { useEffect, useState } from "react";
import RouteSelection from "./routeList.tsx";
import Map from "./map.tsx";
import { parseBusData } from "./busData.tsx";
import lastModified from "../data/lastModified.json";

const App = () => {
  // Fetch last date of fetch from gist
  const [lastFetchedChicago, setLastFetchedChicago] = useState("");
  useEffect(() => {
    const fetchGist = async () => {
      const response = await fetch('https://api.github.com/gists/cfe1d1c07128822245c55596e7e60971');
      const data = await response.json();
      const fileContent = data.files['lastFetched.json'].content;
      const lastFetchedGMT = new Date(fileContent);
      const formattedDate = lastFetchedGMT.toLocaleString('en-US', {
        timeZone: 'America/Chicago',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      setLastFetchedChicago(formattedDate);
    };
    fetchGist();
  }, []);

  // The most recent month of data is used as the end date for the date selector
  const lastMonth = lastModified.lastMonth

  // Start and end dates for date selector
  const [selectedDate1, setSelectedDate1] = useState("2001-01");
  const [selectedDate2, setSelectedDate2] = useState(lastMonth);

  // Key prop for map component state management
  const [key, setKey] = useState(`${selectedDate1}-${selectedDate2}`);

  // Filtered routes sent to both the route list and map
  const filteredRoutes = parseBusData(selectedDate1, selectedDate2);

  // Handler for date selector
  const dateChangeHandler = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value);
      setKey(`${selectedDate1}-${selectedDate2}`);
    };

  return (
    <div className="container">
      <aside className="sidebar">
        <pre>Data last fetched: {lastFetchedChicago} (Chicago) ✨</pre>
        <label>
          Select years and months to compare:
          {[selectedDate1, selectedDate2].map((selectedDate, index) => (
            <div key={index}>
              <input
                name="date"
                type="month"
                min="2001-01"
                max={lastMonth}
                value={selectedDate}
                onChange={index === 0 ?
                  dateChangeHandler(setSelectedDate1) :
                  dateChangeHandler(setSelectedDate2)}
              />
            </div>
          ))}
        </label>
        <RouteSelection
          selectedDate1={selectedDate1}
          selectedDate2={selectedDate2}
          filteredRoutes={filteredRoutes}
        />
      </aside>
      <main>
        <Map keyProp={key} filteredRoutes={filteredRoutes} />
      </main>
    </div>
  );
};

export default App;
