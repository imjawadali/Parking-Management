const { noOfSlots } = require("../../../config");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  const insertList = []
  for (let index = 0; index < noOfSlots; index++) {
    insertList.push({
      slot_number: `${index + 1}`,
      isUnderMaintenance: false
    })
  }
  if (insertList.length)
    await knex('parking_slots')
      .insert(insertList)
      .onConflict(['slot_number'])
      .ignore()
  await knex('parking_slots')
    .del()
    .whereRaw('CAST(slot_number AS decimal) > ?', [noOfSlots])
};
