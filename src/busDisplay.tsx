// busDisplay.tsx

import React, { useEffect, useState } from "react";
import { CombinedRoutes } from "./busData.tsx";

interface RouteSelectionProps {
  selectedDate1: string;
  selectedDate2: string;
  onDateChange1: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange2: (event: React.ChangeEvent<HTMLInputElement>) => void;
  filteredRoutes: CombinedRoutes[];
}

function RouteSelection(props: RouteSelectionProps) {
  const {
    selectedDate1,
    selectedDate2,
    onDateChange1,
    onDateChange2,
    filteredRoutes
  } = props;

  // Displaying the datetime of the last time the data was fetched
  // The most recent month of data is used as the end date for the date selector
  const [lastMonth, setLastMonth] = useState('');
  const [lastFetched, setLastFetched] = useState('');
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/jbelian/cta-ridership-changes/main/data/last_modified.txt')
      .then(response => {
        return response.text();
      })
      .then(data => {
        const lines = data.split('\n').map(line => line.replace('\r', ''));
        const lastFetchedGMT = new Date(lines[2].slice(-29));
        const lastFetchedChicago = lastFetchedGMT.toLocaleString('en-US', {
          timeZone: 'America/Chicago',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        setLastFetched(lastFetchedChicago);
        setLastMonth(lines[1].slice(-7));
      })
      .catch(error => {
        console.error('Fetch error:', error);
      });
  }, []);

  const getYearAndMonthName = (dateString: string) => {
    const date = new Date(`${dateString}T00:00:00`);
    const year = date.getFullYear();
    const monthName = new Intl.DateTimeFormat("en-US", {
      month: "short",
    }).format(date);
    return `${monthName} ${year}`;
  };

  return (
    <div>
      <pre>Data last fetched: {lastFetched} (Chicago) ✨</pre>
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
              onChange={(event) =>
                index === 0 ? onDateChange1(event) : onDateChange2(event)
              }
            />
          </div>
        ))}
      </label>
      <table>
        <thead>
          <tr>
            <th>Route</th>
            <th>Route Name</th>
            <th>{getYearAndMonthName(selectedDate1)}</th>
            <th>{getYearAndMonthName(selectedDate2)}</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {filteredRoutes.map((item: CombinedRoutes, index: number) => (
            <tr key={index}>
              <td>{item.route}</td>
              <td>{item.routename}</td>
              <td>{item.monthtotal}</td>
              <td>{item.monthtotal2}</td>
              <td>{item.percentChange}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RouteSelection;
