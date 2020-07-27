import Knex from 'knex';

export async function up(knex: Knex) {
	return knex.schema.createTable('point_items', table => {
		table.increments('id').primary();
		table.integer('point_fk', 10).unsigned().notNullable()
		table.integer('item_fk', 10).unsigned().notNullable();

		table.foreign('item_fk').references('items.id');
		table.foreign('point_fk').references('points.id');

		
	});
}

export async function down(knex: Knex) {
	return knex.schema.dropTable('point_items');
}