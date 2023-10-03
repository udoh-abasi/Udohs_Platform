import { AiFillWarning } from "react-icons/ai";
import DOMPurify from "dompurify";

// NOTE: After sanitizing the text (done below), DOMPurify will call this hook to add the necessary attributes to the tags
DOMPurify.addHook("afterSanitizeAttributes", function (node) {
  // Check if its an <a> tag
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener"); // This is good practice to add when linking to an external site
    node.setAttribute("class", "user-link");
  }

  if (node.tagName === "Q") {
    node.setAttribute("class", "cdx-inline-quote");
  }

  if (node.tagName === "CODE") {
    node.setAttribute("class", "inline-code on-page");
  }

  if (node.tagName === "U") {
    node.setAttribute("class", "cdx-underline");
  }
});

// NOTE: Since we are using 'dangerouslySetInnerHTML', this cleans the text incase the user added any malicious script that needs to be executed
const sanitizedData = (text, allowed_tags) => ({
  // So here, if we set ALLOWED_TAGS to an empty array, all the tags will be taken out, and only the text in the tags will be left
  __html: DOMPurify.sanitize(text, {
    ALLOWED_TAGS: allowed_tags,
    ALLOWED_ATTR: ["href"], // For more security, the only allowed attribute will be href.
  }),
});

const returnParagraph = (text, id) => {
  const allowed_tags = ["b", "q", "i", "code", "u", "a"];
  return (
    <p key={id} className="text-justify my-6">
      <span dangerouslySetInnerHTML={sanitizedData(text, allowed_tags)} />
    </p>
  );
};

const returnNewPart = (key) => (
  <div
    key={key}
    id="newPart"
    className="py-8 text-center text-xl font-bold tracking-widest"
  >
    &#42; &#42; &#42;
  </div>
);

const returnSubHeading = (text, id, alignType) => {
  const allowed_tags = [];
  return (
    <h2
      key={id}
      className={`text-${alignType} text-xl min-[500px]:text-xl font-bold my-6`}
    >
      <span dangerouslySetInnerHTML={sanitizedData(text, allowed_tags)} />
    </h2>
  );
};

const returnCode = (text, id) => (
  <code key={id}>
    <pre className="block my-6 p-2 bg-slate-200 dark:ring-slate-800 dark:bg-slate-800 overflow-auto max-h-screen">
      {text}
    </pre>
  </code>
);

const returnImage = (file, caption, id) => {
  const allowed_tags = ["b", "q", "i", "code", "u", "a"];

  return (
    <figure key={id} className="flex flex-col justify-center items-center">
      <img src={file} alt="" className="my-6" />

      {caption.trim() && (
        <figcaption className="text-sm -mt-3">
          <span
            dangerouslySetInnerHTML={sanitizedData(caption, allowed_tags)}
          />
        </figcaption>
      )}
    </figure>
  );
};

const returnList = (listItems, theListStyling, id) => {
  const allowed_tags = ["b", "q", "i", "code", "u", "a"];
  return (
    <ul key={id} className={`${theListStyling} list-outside pl-4 my-6`}>
      {listItems.map((eachValue, i) => {
        if (eachValue.trim()) {
          return (
            <li className="my-2" key={i}>
              <span
                dangerouslySetInnerHTML={sanitizedData(eachValue, allowed_tags)}
              />
            </li>
          );
        }
      })}
    </ul>
  );
};

const returnQuote = (text, author, id) => {
  const allowed_tags = [];
  return (
    <div key={id} className="flex flex-col items-center my-6">
      <div className="max-w-[450px] text-center">
        <span className="font-bold text-8xl -mb-11 block">&ldquo;</span>

        <blockquote className="italic mb-1 text-xl">
          <span dangerouslySetInnerHTML={sanitizedData(text, allowed_tags)} />
        </blockquote>

        {author && (
          <div className="font-bold">
            <p className="text-xs uppercase">
              <span className="text-2xl mr-1">-</span>

              <span
                dangerouslySetInnerHTML={sanitizedData(author, allowed_tags)}
              />

              <span className="text-2xl ml-1">-</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const returnWarning = (text, id) => {
  const allowed_tags = ["b", "q", "i", "code", "u", "a"];
  return (
    <div key={id} className="flex justify-center">
      <p className="text-center my-6 bg-yellow-500 flex-[0_1_450px] p-4 text-black rounded-xl flex flex-col items-center">
        <AiFillWarning className="inline mr-2 text-4xl" />
        <span dangerouslySetInnerHTML={sanitizedData(text, allowed_tags)} />
      </p>
    </div>
  );
};

const convertEditorJSDataToHTML = (theData) => {
  try {
    const dataBlock = theData.blocks;

    const theMap = dataBlock.map((eachData) => {
      const { id, type, data, tunes } = eachData;

      switch (type) {
        case "paragraph": {
          const text = data.text;

          if (text.trim()) {
            return returnParagraph(text, id);
          }
          return;
        }

        case "delimiter": {
          return returnNewPart(id);
        }

        case "header": {
          const text = data.text;
          const alignType = tunes.MyAlignmentTune.alignment;

          if (text.trim() && alignType) {
            return returnSubHeading(text, id, alignType);
          }
          return;
        }

        case "code": {
          const text = data.code;

          if (text.trim()) {
            return returnCode(text, id);
          }
          return;
        }

        case "image": {
          const file = data.file.url;
          const caption = data.caption;

          if (file.trim()) {
            return returnImage(file, caption, id);
          }
          return;
        }

        case "list": {
          const listItems = data.items;
          const listStyle = data.style;

          let theListStyling = "";

          if (listStyle === "unordered") {
            theListStyling = "list-disc";
          } else if (listStyle === "ordered") {
            theListStyling = "list-decimal";
          }

          if (
            listItems.length > 0 &&
            typeof listItems === "object" &&
            theListStyling
          ) {
            return returnList(listItems, theListStyling, id);
          }
          return;
        }

        case "quote": {
          const text = data.text;
          const author = data.caption;

          if (text.trim()) {
            return returnQuote(text, author, id);
          }
          return;
        }

        case "warning": {
          const text = data.message;
          if (text.trim()) {
            return returnWarning(text, id);
          }
          return;
        }

        default:
          break;
      }
    });

    return theMap;
  } catch (e) {
    console.log("Error with the data from EditorJS", e);
  }
};

export default convertEditorJSDataToHTML;
