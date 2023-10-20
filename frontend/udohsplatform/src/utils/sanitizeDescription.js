import DOMPurify from "dompurify";

// NOTE: Since we are using 'dangerouslySetInnerHTML', this cleans the text incase the user added any malicious script that needs to be executed
const sanitizedData = (text, allowed_tags) => ({
  // So here, if we set ALLOWED_TAGS to an empty array, all the tags will be taken out, and only the text in the tags will be left
  __html: DOMPurify.sanitize(text, {
    ALLOWED_TAGS: allowed_tags,
    ALLOWED_ATTR: ["href"], // For more security, the only allowed attribute will be href.
  }),
});

export default sanitizedData;
