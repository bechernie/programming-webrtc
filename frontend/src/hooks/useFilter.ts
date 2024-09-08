import { useState } from "react";

function useFilter() {
  const filters = [
    "filter-none",
    "filter-grayscale",
    "filter-sepia",
    "filter-noir",
    "filter-psychedelic",
  ];
  const [filterIndex, setFilterIndex] = useState(0);

  function cycleFilter() {
    setFilterIndex((prevState) => (prevState + 1) % filters.length);
  }

  return { filter: filters[filterIndex], cycleFilter };
}

export default useFilter;
