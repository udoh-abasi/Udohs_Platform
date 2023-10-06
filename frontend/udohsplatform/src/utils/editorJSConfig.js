import { profilePicURL } from "../utils/imageURLS";
import axiosClient from "../utils/axiosSetup";
import ImageTool from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import List from "@editorjs/list";
import Delimiter from "@editorjs/delimiter";
import CodeTool from "@editorjs/code";
import Warning from "@editorjs/warning";
import Underline from "@editorjs/underline";
import InlineCode from "@editorjs/inline-code";
import AlignmentTuneTool from "editorjs-text-alignment-blocktune";

// Create a custom quote class here, to use as inline tool on EditorJS, to add <q> tags around selected items
class MyQuoteTool {
  // This means Editor will respect all quote elements with cdx-inline-quote class and our quotations won't be lost
  static get sanitize() {
    return {
      q: {
        class: "cdx-inline-quote",
      },
    };
  }

  static get shortcut() {
    return "CMD+Q";
  }

  // First we let the editors know that this is an inline tool, using 'isinline'
  static get isInline() {
    return true;
  }

  get state() {
    return this._state;
  }

  set state(state) {
    this._state = state;

    this.button.classList.toggle(this.api.styles.inlineToolButtonActive, state);
  }

  // Add initial states
  constructor({ api }) {
    this.api = api;
    this.button = null;
    this._state = false;

    this.tag = "Q"; // NOTE: This tag name (the q) MUST BE in capital letters. So, if you used <div>, it MUST BE 'DIV'
    this.class = "cdx-inline-quote";
  }

  // The editor calls this function to render the HTML content
  render() {
    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.innerHTML = "&#8220; &#8221;";

    this.button.classList.add(this.api.styles.inlineToolButton); // This adds basic styles like, the background turning gray on hover
    this.button.classList.add("font-bold"); // Add Tailwind's bold class here

    //   this.button.classList.add("text-[#388ae5]");

    return this.button;
  }

  wrap(range) {
    const selectedText = range.extractContents();

    // Create <q>> element
    const quote = document.createElement(this.tag);
    quote.classList.add(this.class);

    // Append to the MARK element selected TextNode
    quote.appendChild(selectedText);

    // Insert new element
    range.insertNode(quote);

    this.api.selection.expandToTag(quote); // Without this line, if the user clicks on the quote button more than once, more <q> tags will be added, thereby adding to many quotes round a single selection
  }

  unwrap(range) {
    const text = range.extractContents();
    const quote = this.api.selection.findParentTag(this.tag, this.class); // NOTE: This tag name (the q) MUST BE in capital letters. So, if you used <div>, it MUST BE 'DIV'

    quote.remove();

    range.insertNode(text);
  }

  // The editor calls this function to surround the content that is highlighted in the editor, (given the range)
  surround(range) {
    // If the InlineQuote button is clicked, this will check if the state is true (i.e, if the selected part has already been wrapped with a <q>), the it will unwrap it, else, it will wrap it
    if (this._state) {
      this.unwrap(range);
      return;
    }

    this.wrap(range);
  }

  checkState() {
    const quote = this.api.selection.findParentTag(this.tag);

    this.state = !!quote;
  }
}

// This is the configuration for EditorJS
const editorJSConfiguration = (data, setDraftData) => {
  return {
    holder: "editorJS",

    // Check when the editor is done loading, then do something
    onReady: () => {
      //   setEditorLoading(false);
    },

    // onChange callback.

    // eslint-disable-next-line no-unused-vars
    onChange: (event, api) => {
      // Here, we accessed the saver event and then save the data and store the saved data in a useState
      event.saver.save().then((data) => {
        setDraftData(data);
      });
    },

    // Makes the field gain focus on page load
    // autofocus: true,

    placeholder: "Add a paragraph",

    tools: {
      Inline_Quote: {
        class: MyQuoteTool,
      },

      MyAlignmentTune: {
        class: AlignmentTuneTool,
        config: {
          default: "center",
          blocks: {
            header: "center",
            list: "right",
          },
        },
      },

      underline: Underline,

      inlineCode: {
        class: InlineCode,
        shortcut: "CMD+SHIFT+M",
      },

      header: {
        class: Header,
        inlineToolbar: false,
        config: {
          placeholder: "Sub heading",
          levels: [2, 3],
          defaultLevel: 2,
        },
        tunes: ["MyAlignmentTune"],
      },

      image: {
        class: ImageTool,
        inlineToolbar: true,
        config: {
          // endpoints: {
          //   byFile: `${profilePicURL}/api/uploadFile`, // The endpoint to upload images
          // },
          type: "image/*",
          captionPlaceholder: "Caption (optional)",
          uploader: {
            /**
             * Upload file to the server and return an uploaded image data
             * @param {File} file - file selected from the device or pasted by drag-n-drop
             * @return {Promise.<{success, file: {url}}>}
             */
            async uploadByFile(file) {
              const response = await axiosClient.post(
                `${profilePicURL}/api/uploadFile`,
                { image: file },
                {
                  headers: {
                    "content-type": "multipart/form-data",
                  },
                }
              );

              const data = await response.data;

              return data;
            },
          },
        },
      },

      delimiter: {
        class: Delimiter,
      },

      list: {
        class: List,
        inlineToolbar: true,
        config: {
          defaultStyle: "unordered",
        },
      },

      code: {
        class: CodeTool,
        config: { placeholder: "Enter a code" },
      },

      warning: {
        class: Warning,
        inlineToolbar: true,
        shortcut: "CMD+SHIFT+W",
        config: {
          titlePlaceholder: "Title",
          messagePlaceholder: "Message",
          autofocus: false,
        },
      },

      quote: {
        class: Quote,
        inlineToolbar: false,
        shortcut: "CMD+SHIFT+Q",
        config: {
          quotePlaceholder: "Enter a quote",
          captionPlaceholder: "Quote's author",
          alignment: "center", // This is NOT working
        },
      },
    },

    // Data to pre-populate the EditorJS with
    data: data(),
  };
};

export const theData = {
  time: 1696081007705,
  blocks: [
    {
      id: "v9cuSn-kSh",
      type: "paragraph",
      data: {
        text: "The paragraph is here",
      },
    },
    {
      id: "hOMcdzh74S",
      type: "header",
      data: {
        text: "Header level 2 right align",
        level: 2,
      },
      tunes: {
        MyAlignmentTune: {
          alignment: "right",
        },
      },
    },
    {
      id: "nYBrjrPJcf",
      type: "header",
      data: {
        text: "Header level 3 Center align",
        level: 3,
      },
      tunes: {
        MyAlignmentTune: {
          alignment: "center",
        },
      },
    },
    {
      id: "MaWNAceJAK",
      type: "header",
      data: {
        text: "Header level 2 left align",
        level: 2,
      },
      tunes: {
        MyAlignmentTune: {
          alignment: "left",
        },
      },
    },
    {
      id: "n8LmW6JsEM",
      type: "image",
      data: {
        file: {
          // url: "http://localhost:8000/media/200x360_1Ssa5rL",
          url: "http://localhost:8000/media/Frontend_to_use_2_8se0Btg",
        },
        caption: "This is the caption of my image",
        withBorder: false,
        stretched: false,
        withBackground: false,
      },
    },
    {
      id: "aXOD34UaX_",
      type: "delimiter",
      data: {},
    },
    {
      id: "75sdiOi2Vq",
      type: "list",
      data: {
        style: "unordered",
        items: ["Ul 1", "Ul 2", "Ul 3"],
      },
    },
    {
      id: "jE2eFvIUAs",
      type: "list",
      data: {
        style: "ordered",
        items: ["Ol 1", "Ol 2", "Ol 3"],
      },
    },
    {
      id: "bgbhxOxB5s",
      type: "code",
      data: {
        code: "const config = {\n  header: {\n    disableDefaultStyle: true,\n  },\n  image: {\n    disableDefaultStyle: true,\n  },\n  video: {\n    disableDefaultStyle: true,\n  },\n};\n\nconst Post = () => <section><Output data={...} config={ config } /></section>;\n\nexport default Post;",
      },
    },
    {
      id: "-S6GBUt4rP",
      type: "warning",
      data: {
        title: "",
        message: "This is the warning sign",
      },
    },
    {
      id: "HgW9t_pJfL",
      type: "quote",
      data: {
        text: "This is a quote center align  is a quote center align  is a quote center align",
        caption: "Author Udoh Abasi  Udoh Abasi  Udoh Abasi",
        alignment: "center",
      },
    },
    {
      id: "kpTvZbA3kf",
      type: "quote",
      data: {
        text: "This is another quote left aligned",
        caption: "Author is Udoh abasi",
        alignment: "left",
      },
    },
  ],
  version: "2.28.0",
};

// export const theData = {
//   time: 1696241752174,
//   blocks: [
//     {
//       id: "_HFitWYIEQ",
//       type: "warning",
//       data: {
//         message:
//           'The <b>bold </b><i>italic </i><a href="http://tenece.com">link </a><q class="cdx-inline-quote">quote</q>&nbsp; <code class="inline-code">code </code>&nbsp;<u class="cdx-underline">underline</u>',
//       },
//     },
//   ],
//   version: "2.28.0",
// };

export default editorJSConfiguration;
