export const getMonthAndYearOfDate = (date) => {
  try {
    const postDate = new Date(date);

    return `${postDate.toLocaleString("en-US", {
      month: "long",
    })}, ${postDate.getFullYear()}`;
  } catch {
    // Do nothing
  }
};

// This function gets the the first paragraph of every article and uses it as the description
export const getDescription = (eachData) => {
  try {
    // Convert the text to a JSON and get the block.
    const theMainArticle = JSON.parse(eachData.theMainArticle);
    const block = theMainArticle.blocks;

    // This keeps tracks of the text (incase the user put a short text in the paragraph box)
    let allText = "";

    for (let index = 0; index < block.length; index++) {
      // First we check if the all the text is up to 100, then return it
      if (allText.length > 100) {
        return allText;
      }

      // Get the block
      const element = block[index];

      // Get the type of the block and check if it is a paragraph
      const { type, data } = element;
      if (type === "paragraph") {
        // Get the text of the paragraph
        const text = data.text;

        if (text.trim().length < 100) {
          // If the text is not up to 100 characters, add it to the 'allText' string, else return that paragraph
          allText += ` ${text.trim()}`;
        } else {
          return text.trim();
        }
      }
    }

    // If the loop finishes, return the 'allText' string
    return allText;
  } catch {
    //Ignore
  }
};
