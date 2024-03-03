const { time, uuid } = require("../../src/utils");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('parking_alocations', table => {
        table.uuid('id')
            .primary()
            .defaultTo(uuid.get());
        table.string('slot_number')
            .notNullable();
        table.string('vehicle_number')
        table.boolean('is_active')
            .defaultTo(true)
        table.integer('total_minutes')
        table.integer('amount_charged')
        table.timestamp('parked_at')
            .defaultTo(knex.fn.now())
        table.timestamp('unparked_at')
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('parking_alocations');
};
