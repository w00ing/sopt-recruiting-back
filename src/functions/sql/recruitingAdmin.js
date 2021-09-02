const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const addUserWithIdFirebase = async (client, email, idFirebase) => {
  const { rows } = await client.query(
    `
    INSERT INTO "user"
    (email, id_firebase)
    VALUES
    ($1, $2)
    RETURNING *
    `,
    [email, idFirebase],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getRecruitingAdminById = async (client, id) => {
  const rows = await client.query(
    `
    SELECT id, email, is_admin, is_deleted, created_at, updated_at, id_firebase
    FROM recruiting_admin
    WHERE id = ${id}
    AND is_deleted = FALSE
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getRecruitingAdminByIdFirebase = async (client, idFirebase) => {
  const rows = await client.query(
    `
    SELECT id, email, is_admin, is_deleted, created_at, updated_at, id_firebase
    FROM recruiting_admin
    WHERE id_firebase = ?
    AND is_deleted = FALSE
    `,
    [idFirebase],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getUserByEmailAndIdFirebaseIncludingDeleted = async (client, email, idFirebase) => {
  const rows = await client.query(
    `
    SELECT id, email, is_admin, is_deleted, created_at, updated_at, id_firebase
    FROM recruiting_admin
    WHERE id_firebase = ?
    AND email = ? 
    `,
    [idFirebase, email],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { addUserWithIdFirebase, getRecruitingAdminByIdFirebase, getUserByEmailAndIdFirebaseIncludingDeleted, getRecruitingAdminById };
