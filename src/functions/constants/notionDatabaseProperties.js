const databaseProperties = {
  id: {
    type: "number",
    number: {},
    // people: {},
  },
  name: {
    type: "title",
    title: {},
  },
  지원파트: {
    type: "select",
    select: {
      options: [
        { name: "iOS", color: "purple" },
        { name: "안드로이드", color: "yellow" },
        { name: "서버", color: "green" },
        { name: "기획", color: "red" },
        { name: "디자인", color: "orange" },
        { name: "웹", color: "blue" },
      ],
    },
  },
  "읽어야할까?": {
    type: "multi_select",
    multi_select: {
      options: [
        { name: "읽마 by 회장", color: "yellow" },
        { name: "읽마 by 부회장", color: "green" },
        { name: "읽마 by 총무", color: "red" },
        { name: "읽마 by 미팀장", color: "blue" },
        { name: "읽마 by 운팀장", color: "purple" },
        { name: "읽마 by 기팟장", color: "orange" },
        { name: "읽마 by 디팟장", color: "gray" },
        { name: "읽마 by 서팟장", color: "brown" },
        { name: "읽마 by 아팟장", color: "pink" },
        { name: "읽마 by 안팟장", color: "yellow" },
        { name: "읽마 by 웹팟장", color: "green" },
      ],
    },
  },
  읽은사람: {
    type: "multi_select",
    multi_select: {
      options: [
        { name: "회장", color: "yellow" },
        { name: "부회장", color: "green" },
        { name: "총무", color: "red" },
        { name: "미팀장", color: "blue" },
        { name: "운팀장", color: "purple" },
        { name: "기팟장", color: "gray" },
        { name: "디팟장", color: "orange" },
        { name: "서팟장", color: "brown" },
        { name: "아팟장", color: "pink" },
        { name: "안팟장", color: "yellow" },
        { name: "웹팟장", color: "green" },
      ],
    },
  },
  학교: {
    type: "select",
    select: { options: [] },
  },
  학과: {
    type: "multi_select",
    multi_select: { options: [] },
  },
  전화번호: {
    type: "phone_number",
    phone_number: {},
  },
  비고: {
    type: "rich_text",
    rich_text: {},
  },

  서류합격: {
    type: "checkbox",
    checkbox: {},
  },
  면접합격자: {
    type: "checkbox",
    checkbox: {},
  },
};

module.exports = databaseProperties;
