const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getRecruitingApplicants = async (client) => {
  const rows = await client.query(
    `
    SELECT * FROM recruiting_applicant
    `,
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const getRecruitingApplicantByNameAndPhone = async (client, name, phone) => {
  const rows = await client.query(
    `
    SELECT * FROM recruiting_applicant
    WHERE name = ?
    AND phone = ?
    AND is_deleted = FALSE
    AND is_for_test = FALSE
    `,
    [name, phone],
  );

  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getRecruitingApplicantsBySeasonAndGroup = async (client, season, group) => {
  const rows = await client.query(
    `
    SELECT * FROM recruiting_applicant
    WHERE season = ?
    AND \`group\` = ?
    AND is_deleted = FALSE
    AND is_for_test = FALSE
    `,
    [season, group],
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const getRecruitingApplicantsBySeasonAndGroupWithOffsetLimitAndNameSearchKeyword = async (client, season, group, offset = 0, limit = 20, nameSearchKeyword) => {
  const rows = await client.query(
    `
    SELECT * FROM recruiting_applicant
    WHERE season = ?
    AND \`group\` = ?
    AND is_deleted = FALSE
    AND is_for_test = FALSE
    ${nameSearchKeyword ? `AND name LIKE '%${nameSearchKeyword}%'` : ``}
    LIMIT ${limit} OFFSET ${offset} 
    `,
    [season, group],
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const getRecruitingApplicantById = async (client, recruitingApplicantId) => {
  const rows = await client.query(
    `
    SELECT * FROM recruiting_applicant
    WHERE id = ?
    `,
    [recruitingApplicantId],
  );

  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const addRecruitingApplicant = async (
  client,
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
  nearestStation,
) => {
  const existingRows = await client.query(
    `
    SELECT * FROM recruiting_applicant
    WHERE phone = ?
    AND name = ?
    AND is_deleted = FALSE
    AND is_for_test = FALSE
    `,
    [phone, name],
  );

  if (existingRows.length > 0) return convertSnakeToCamel.keysToCamel(existingRows[0]);

  const rows = await client.query(
    `
  INSERT INTO recruiting_applicant
  (address, birthday, college, email, gender, \`group\`, known_path, leave_absence, major, most_recent_season, \`name\`, part, phone, pic, season, univ_year, will_appjam, nearest_station)
  VALUES
  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  RETURNING *
  `,
    [address, birthday, college, email, gender, group, knownPath, leaveAbsence, major, mostRecentSeason, name, part, phone, pic, season, univYear, willAppjam, nearestStation],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getApplicantCount = async (client) => {
  const rows = await client.query(
    `
  SELECT COUNT(id) count FROM recruiting_applicant
  WHERE is_deleted = FALSE
  AND is_for_test = FALSE
  `,
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getApplicantCountBySeasonAndGroup = async (client, season, group) => {
  const rows = await client.query(
    `
  SELECT COUNT(id) count FROM recruiting_applicant
  WHERE season = ?
  AND \`group\` = ?
  AND is_deleted = FALSE
  AND is_for_test = FALSE
  `,
    [season, group],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = {
  getRecruitingApplicants,
  addRecruitingApplicant,
  getApplicantCount,
  getApplicantCountBySeasonAndGroup,
  getRecruitingApplicantById,
  getRecruitingApplicantByNameAndPhone,
  getRecruitingApplicantsBySeasonAndGroup,
  getRecruitingApplicantsBySeasonAndGroupWithOffsetLimitAndNameSearchKeyword,
};
