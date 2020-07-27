import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent }from 'leaflet';

import './styles.css';

import logo from '../../assets/logo.svg';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



interface Item {
	id: number;
	name: string;
	image_url: string;
}

interface  IBGEUFResponse {
	sigla: string;
}

interface IBGEDistrictResponse {
	nome: string;
}

const CreatePoint = () => {
	const [items, setItems] = useState<Item[]>([]);
	const [selectedItems, setSelectedItems] = useState<number[]>([]);

	const [ufs, setUfs] = useState<string[]>([]);
	const [selectedUf, setSelectedUf] = useState('0');

	const [districts, setDistricts] = useState<string[]>([]);
	const [selectedDistrict, setSelectedDistrict] = useState('0');

	const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);

	const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		whatsapp: '',
	});

	const history = useHistory();

	useEffect(() => {
		navigator.geolocation.getCurrentPosition(position => {
			const { latitude, longitude } = position.coords;

			setInitialPosition([latitude, longitude]);
		})
	}, []);

	useEffect(() => {
		api.get('items').then(response => {
			setItems(response.data);
		});
	}, []);

	useEffect(() => {
		axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
			const ufInitials = response.data.map(uf =>uf.sigla);
			setUfs(ufInitials.sort());
		});
	}, []);

	useEffect(() => {
		axios
			.get<IBGEDistrictResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/distritos`)
			.then(response => {
				const districtNames = response.data.map(district => district.nome);
				setDistricts(districtNames.sort());
			}
		)
	}, [selectedUf]);

	function hadleSelectUf(event: ChangeEvent<HTMLSelectElement>){
		const uf = event.target.value;

		setSelectedUf(uf);
	};

	function handleSelectDistrict(event: ChangeEvent<HTMLSelectElement>) {
		const district = event.target.value;

		setSelectedDistrict(district);
	}

	function handleMapClick(event: LeafletMouseEvent) {
		setSelectedPosition([
			event.latlng.lat,
			event.latlng.lng,
		])
	}

	function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
		const { name, value } = event.target; 
		setFormData({ ...formData, [name]: value })
	}

	function handleSelectItem(id: number) {
		const alreadySelected = selectedItems.findIndex(item => item === id);
 	
		if(alreadySelected >= 0) {
			const filteredItems = selectedItems.filter(item => item !== id);

			setSelectedItems(filteredItems);
		} else {
			setSelectedItems([ ...selectedItems, id ]);
		}
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();

		const { name, email, whatsapp } = formData;
		const uf = selectedUf;
		const district = selectedDistrict;
		const [latitude, longitude] = selectedPosition;
		const items = selectedItems;

		const data = {
			name,
			email,
			whatsapp,
			uf,
			district,
			latitude,
			longitude,
			items
		};

		await api.post('points', data);

		toast('✅ Ponto de coleta cadastrado com sucesso!', {
			autoClose: 2500,
		    hideProgressBar: false,
		    closeOnClick: true,
		    pauseOnHover: false,
		    draggable: true,
		    progress: undefined,
		    pauseOnFocusLoss: false,
		    onClose: () => history.push('/'),
		});

	}

	return (
		<div id="page-create-point">
			<header>
				<img src={logo} alt="Ecoleta" />
	      		<ToastContainer />

				<Link to="/">
				<FiArrowLeft />
					Voltar para a página inicial
				</Link>
			</header>

			<form onSubmit={handleSubmit}>
				<h1>Cadastro do ponto de coleta</h1>

				<fieldset>
					<legend>
						<h2>Dados</h2>
					</legend>

					<div className="field">
						<label htmlFor="name">Nome da entidade</label>
						<input
							type="text"
							name="name"
							id="name"
							placeholder="Digite o nome da entidade"
							onChange={handleInputChange}
						/>
					</div>
					<div className="field-group">
						<div className="field">
							<label htmlFor="email">Email da entidade</label>
							<input
								type="email"
								name="email"
								id="email"
								placeholder="Digite o email da entidade"
								onChange={handleInputChange}
							/>
						</div>

						<div className="field">
							<label htmlFor="email">Whatsapp da entidade</label>
							<input
								type="text"
								name="whatsapp"
								id="whatsapp"
								placeholder="Digite o whatsapp da entidade"
								onChange={handleInputChange}
							/>
						</div>	
					</div>
				</fieldset>

				<fieldset>
					<legend>
						<h2>Endereço</h2>
						<span>Selecione o endereço no mapa</span>
					</legend>

					<Map center={initialPosition} zoom={16} onClick={handleMapClick}>
						<TileLayer
				          	attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				         	url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				        />

				        <Marker position={selectedPosition} />
					</Map>

					<div className="field-group">
						<div className="field">
							<label htmlFor="uf">Estado (UF)</label>
							<select name="uf" id="uf" onChange={hadleSelectUf} value={selectedUf}>
								<option value="0">Selecione uma UF</option>
								{ufs.map(uf => (
									<option value={uf} key={uf}>{uf}</option>
								)
								)}
							</select>
						</div>

						<div className="field">
							<label htmlFor="city">Cidade/Distrito</label>
							<select 
								name="city"
								id="city" 
								value={selectedDistrict}
								onChange={handleSelectDistrict}
							>
								<option value="0">Selecione uma cidade/distrito</option>
								{districts.map(district => (
									<option value={district} key={district}>{district}</option>
								)

								)}
							</select>
						</div>
					</div>
				</fieldset>

				<fieldset>
					<legend>
						<h2>Ítens de coleta</h2>
						<span>Selecione um ou mais intens abaixo</span>
					</legend>

					<ul className="items-grid">
						{items.map(item => (
							<li 
								key={String(item.id)} 
								onClick={() => handleSelectItem(item.id)} 
								className={selectedItems.includes(item.id) ? 'selected' : ''}
							>
								<img src={item.image_url} alt={item.name} />
								<span>{item.name}</span>
							</li>
						))
						}	
					</ul>	
				</fieldset>

				<button type="submit">
					Cadastrar ponto de coleta
				</button>
			</form>
		</div>
 	);	
};

export default CreatePoint;