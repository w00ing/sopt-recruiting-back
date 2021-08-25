const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getRecruitingApplicants = async (client) => {
  const rows = await client.query(
    `
    SELECT * FROM recruiting_applicant
    `,
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const addRecruitingApplicant = async (
  client,
  recruitingApplicantId,
  address,
  birthday,
  college,
  email,
  gender,
  group,
  knownPath,
  leaveAbsence,
  major,
  mostRecentSeason,
  name,
  part,
  phone,
  pic,
  season,
  univYear,
  willAppjam,
) => {
  const existingRows = await client.query(
    `
    SELECT * FROM recruiting_applicant
    WHERE id = ${recruitingApplicantId}
    AND is_deleted = FALSE
    AND is_for_test = FALSE
    `,
  );

  if (existingRows.length > 0) return convertSnakeToCamel.keysToCamel(existingRows[0]);

  const rows = await client.query(
    `
  INSERT INTO recruiting_applicant
  (address, birthday, college, email, gender, \`group\`, known_path, leave_absence, major, most_recent_season, \`name\`, part, phone, pic, season, univ_year, will_appjam)
  VALUES
  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  RETURNING *
  `,
    [address, birthday, college, email, gender, group, knownPath, leaveAbsence, major, mostRecentSeason, name, part, phone, pic, season, univYear, willAppjam],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = {
  getRecruitingApplicants,
  addRecruitingApplicant,
};
