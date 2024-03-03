const { time } = require("../../src/utils");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('parking_slots', table => {
        table.string('slot_number')
            .primary();
        table.boolean('is_under_maintenance');
        table.timestamp('created_at')
            .defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('parking_slots');
};
