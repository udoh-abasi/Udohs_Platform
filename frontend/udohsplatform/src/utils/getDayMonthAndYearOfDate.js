// This function takes a date-time format, and returns the date formatted to either 'Today' or 'Yesterday' or the day of the week or the actual date
const getDayMonthAndYearOfDate = (inputDate) => {
  // Convert the input string to a javascript Date object
  const inputDateTime = new Date(inputDate);

  // Get the current date
  const currentDate = new Date();

  // Set the time of both dates to midnight to compare dates only
  inputDateTime.setHours(0, 0, 0, 0);
  currentDate.setHours(0, 0, 0, 0);

  // Calculate the difference in milliseconds between the input date and today's date
  const dateDifference = currentDate - inputDateTime;

  // Calculate the difference in days
  const daysDifference = dateDifference / (24 * 60 * 60 * 1000);

  // If days difference is zero, that means the post was made today
  if (daysDifference.toFixed() === "0") {
    return "Today";
  } else if (daysDifference.toFixed() === "1") {
    return "Yesterday";
  } else if (daysDifference.toFixed() < 7) {
    // If days difference is less than 6 days, that means the post was made within the last 7 days, so we want to return the day of the week
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const dayOfTheWeekIndex = inputDateTime.getDay();

    return daysOfWeek[dayOfTheWeekIndex];
  } else {
    // Here, we return the date in the format November 14, 2023
    return `${inputDateTime.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
    })}, ${inputDateTime.getFullYear()}`;
  }
};

export default getDayMonthAndYearOfDate;
