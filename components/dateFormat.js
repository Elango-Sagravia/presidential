export const changeFormatDate = (isoDate) => {
  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  const formattedDate = new Date(isoDate).toLocaleDateString("en-GB", options);

  return formattedDate;
};

export const changeFormatDay = (isoDate) => {
  const options = { weekday: "long" };
  const formattedDay = new Date(isoDate).toLocaleDateString("en-GB", options);

  return formattedDay;
};
