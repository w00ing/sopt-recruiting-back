const dotenv = require('dotenv');
const { Client } = require('@notionhq/client');
const databaseProperties = require('../constants/notionDatabaseProperties');

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_KEY });

const databaseId = process.env.NOTION_DATABASE_ID;

async function setDatabase(text) {
  const payload = {
    path: `databases/${databaseId}`,
    method: 'PATCH',
    body: {
      title: [
        {
          text: {
            content: text,
          },
        },
      ],
      properties: databaseProperties,
    },
  };

  try {
    const response = await notion.request(payload);
    console.log(response);
    console.log('Success! Entry added.');
  } catch (error) {
    console.error(error.body);
  }
}

const generateQuestionAnswerPair = (question, answer) => {
  const child = [
    {
      type: 'paragraph',
      paragraph: {
        text: [
          {
            type: 'text',
            text: {
              content: `${question.order}. ${question.question}`,
            },
            annotations: {
              bold: true,
              code: true,
              // color: "gray_background",
            },
          },
        ],
      },
    },
    {
      type: 'paragraph',
      paragraph: {
        text: [
          {
            type: 'text',
            text: {
              content: answer.answer,
            },
          },
        ],
      },
    },
  ];
  return child;
};

const generateQuestionAnswerPairsLegacy = (commonQuestions, partQuestions, applicant) => {
  const commonQuestionsBlocks = commonQuestions
    .map((cq, index) => {
      return [
        {
          type: 'paragraph',
          paragraph: {
            text: [
              {
                type: 'text',
                text: {
                  content: `${cq.order}. ${cq.question} (${cq.charLimit}자)\n`,
                },
                annotations: {
                  bold: true,
                  code: true,
                  // color: "gray_background",
                },
              },
            ],
          },
        },
        {
          type: 'paragraph',
          paragraph: {
            text: [
              {
                type: 'text',
                text: {
                  content: `${applicant.commonAnswers[index]}\n(${applicant.commonAnswers[index].length})\n\n`,
                },
              },
            ],
          },
        },
      ];
    })
    .flat();

  const partQuestionsBlocks = partQuestions
    .map((pq, index) => {
      return [
        {
          type: 'paragraph',
          paragraph: {
            text: [
              {
                type: 'text',
                text: {
                  content: `${pq.order}. ${pq.question} (${pq.charLimit}자)\n`,
                },
                annotations: {
                  bold: true,
                  code: true,
                  // color: "gray_background",
                },
              },
            ],
          },
        },
        {
          type: 'paragraph',
          paragraph: {
            text: [
              {
                type: 'text',
                text: {
                  content: `${applicant.partAnswers[index]}\n(${applicant.partAnswers[index].length})\n\n`,
                },
              },
            ],
          },
        },
      ];
    })
    .flat();
  return [...commonQuestionsBlocks, ...partQuestionsBlocks];
};

const createPage = async (commonQuestions, partQuestions, applicant) => {
  try {
    const res = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: applicant.name,
              },
            },
          ],
        },
        id: {
          number: applicant.id,
        },
        지원파트: {
          select: {
            name: applicant.part,
          },
        },
        학교: {
          select: {
            name: applicant.college,
          },
        },
        학과: {
          multi_select: [
            {
              name: applicant.major,
            },
          ],
        },
        전화번호: {
          phone_number: applicant.phone,
        },
      },
      children: generateQuestionAnswerPair(commonQuestions, partQuestions),
    });
    console.log(res);
    console.log('Success! Entry added.');
    return res;
  } catch (error) {
    console.log(error);
  }
};

const createPageLegacy = async (commonQuestions, partQuestions, applicant) => {
  try {
    const res = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: applicant.name,
              },
            },
          ],
        },
        id: {
          number: applicant.id,
        },
        지원파트: {
          select: {
            name: applicant.part,
          },
        },
        학교: {
          select: {
            name: applicant.college,
          },
        },
        학과: {
          multi_select: [
            {
              name: applicant.major,
            },
          ],
        },
        전화번호: {
          phone_number: applicant.phone,
        },
      },
      children: generateQuestionAnswerPairsLegacy(commonQuestions, partQuestions, applicant),
    });
    console.log(res);
    console.log('Success! Entry added.');
    return res;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { setDatabase, createPage, createPageLegacy };
