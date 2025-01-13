// const options = {
//   weekday: "short",
//   day: "2-digit",
//   month: "short",
//   year: "numeric",
// };

// const changeFormat = (isoDate) => {
//   const formattedDate = new Date(isoDate).toLocaleDateString("en-GB", options);

//   return formattedDate;
// };

// export default changeFormat;

const options = { weekday: "long" };

const changeFormat = (isoDate) => {
  const formattedDay = new Date(isoDate).toLocaleDateString("en-GB", options);

  return formattedDay;
};

export default changeFormat;
