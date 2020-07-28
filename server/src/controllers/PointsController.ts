import knex from '../database/connection';
import { Request, Response } from 'express';

class PointsController {
	async index(request: Request, response: Response) {
		const { district, uf, items } = request.query;

		const parsedItems = String(items).split(',').map(item => Number(item.trim()));

		const points = await knex('points')
			.join('point_items', 'points.id', '=', 'point_items.point_fk')
			.whereIn('point_items.item_fk', parsedItems)
			.where('uf', String(uf))
			.where('district', String(district))
			.distinct()
			.select('points.*');

		const serializedPoints = points.map(point => {
			return {
				...point,
				image_url: `http://192.168.0.109:3333/uploads/${point.image}`,
			};
		});
			
		return response.json(serializedPoints);
	}

	async show(request: Request, response: Response) {
		const { id } = request.params;

		const point = await knex('points').where('id', id).first();

		if (!point) {
			return response.status(400).json({ message: 'Point not found.'});
		}

		const serializedPoint = {
				...point,
				image_url: `http://192.168.0.109:3333/uploads/${point.image}`,
		};

		const items = await knex('items')
			.join('point_items', 'items.id', '=', 'point_items.item_fk')
			.where('point_items.point_fk', id)
			.select('items.title');

		return response.json({ point: serializedPoint, items });
	}

	async create(request: Request, response: Response) {
		const {
			name,
			email,
			whatsapp,
			latitude,
			longitude,
			district,
			uf,
			items
		} = request.body;

		const transaction = await knex.transaction();

		const newPoint = {
			image: request.file.filename,
			name,
			email,
			whatsapp,
			latitude,
			longitude,
			district,
			uf	
		}

		const insertedIds = await transaction('points').insert(newPoint);

		const pointItems = items
			.split(',')
			.map((item: string) => Number(item.trim()))
			.map((item_id: number) => {
				return {
					item_fk: item_id,
					point_fk: insertedIds[0],
				};
			});

		await transaction('point_items').insert(pointItems);

		transaction.commit();

		return response.json({ 
			id: insertedIds[0],
			...newPoint
		});
	}
}

export default PointsController;