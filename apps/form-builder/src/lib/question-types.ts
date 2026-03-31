export interface QuestionTypeInfo {
  type: string;
  label: string;
  icon: string;
  defaultProps: Record<string, unknown>;
}

export const QUESTION_TYPES: QuestionTypeInfo[] = [
  {
    type: "text",
    label: "Text Input",
    icon: "Aa",
    defaultProps: { inputType: "text", placeholder: "" },
  },
  {
    type: "comment",
    label: "Long Text",
    icon: "\u00b6",
    defaultProps: { rows: 4, placeholder: "" },
  },
  {
    type: "radiogroup",
    label: "Radio Group",
    icon: "\u25C9",
    defaultProps: { choices: ["Option 1", "Option 2", "Option 3"] },
  },
  {
    type: "checkbox",
    label: "Checkboxes",
    icon: "\u2611",
    defaultProps: { choices: ["Option 1", "Option 2", "Option 3"] },
  },
  {
    type: "dropdown",
    label: "Dropdown",
    icon: "\u25BE",
    defaultProps: { choices: ["Option 1", "Option 2", "Option 3"] },
  },
  {
    type: "boolean",
    label: "Yes / No",
    icon: "\u2713\u2717",
    defaultProps: { labelTrue: "Yes", labelFalse: "No" },
  },
  {
    type: "rating",
    label: "Rating",
    icon: "\u2605",
    defaultProps: { rateMin: 1, rateMax: 5 },
  },
  {
    type: "ranking",
    label: "Ranking",
    icon: "#",
    defaultProps: { choices: ["Item 1", "Item 2", "Item 3"] },
  },
  {
    type: "imagepicker",
    label: "Image Picker",
    icon: "\uD83D\uDDBC",
    defaultProps: {
      choices: [
        { value: "img1", imageLink: "https://placehold.co/150x100" },
        { value: "img2", imageLink: "https://placehold.co/150x100" },
      ],
    },
  },
  {
    type: "matrix",
    label: "Matrix",
    icon: "\u229E",
    defaultProps: {
      columns: ["Col 1", "Col 2", "Col 3"],
      rows: ["Row 1", "Row 2"],
    },
  },
  {
    type: "multipletext",
    label: "Multiple Text",
    icon: "=",
    defaultProps: {
      items: [{ name: "field1", title: "Field 1" }, { name: "field2", title: "Field 2" }],
    },
  },
  {
    type: "html",
    label: "HTML Block",
    icon: "</>",
    defaultProps: { html: "<p>Custom HTML content</p>" },
  },
];

export function getQuestionTypeInfo(type: string): QuestionTypeInfo | undefined {
  return QUESTION_TYPES.find((qt) => qt.type === type);
}
