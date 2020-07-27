import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import { View, Image, StyleSheet, Text, ImageBackground } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';

interface IBGEUFResponse {
	sigla: string;
};

interface IBGEDistrictResponse {
	nome: string;
}

const Home = () => {
	const navigation = useNavigation();

	const [ufs, setUfs] = useState<string[]>([]);
	const [selectedUf, setSelectedUf] = useState('0');

	const [districts, setDistricts] = useState<string[]>([]);
	const [selectedDistrict, setSelectedDistrict] = useState('0');


	useEffect(() => {
		axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
			const ufInitials = response.data.map(uf => uf.sigla);
			setUfs(ufInitials.sort());
		});
	}, []);

	useEffect(() => {
		axios.get<IBGEDistrictResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/distritos`)
			.then(response => {
				const districtNames = response.data.map(district => district.nome);
				setDistricts(districtNames.sort());
			}
		)
	}, [selectedUf]) 

	function handleSelectUF(ufSelected: string) {
		setSelectedUf(ufSelected);
	}

	function handelSelectDistrict(districtSelected: string) {
		setSelectedDistrict(districtSelected);
	}

	function handlenavigateToPoints() {
		navigation.navigate('Points', { selectedUf: selectedUf, selectedDistrict: selectedDistrict});
	};

	return (
		<ImageBackground
			source={require('../../assets/home-background.png')} 
			style={styles.container}
			imageStyle={{ width: 274, height: 368 }}
		>
		
			<View style={styles.main}>
				<Image source={require('../../assets/logo.png')} />
				<Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
				<Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
			</View>

			<View style={styles.footer}>
				<RNPickerSelect
            		onValueChange={ (value) => handleSelectUF(value)}
		            items={
		            	ufs.map(uf => ({
		            		label: uf,
		            		value: uf,
		            		key: uf,
	            		}))
		            }
		            placeholder={{
		            	label: "Selecione uma UF", 
		            	value: null
		            }}
        		/>

        		<RNPickerSelect
            		onValueChange={ (value) => handelSelectDistrict(value)}
		            items={
		            	districts.map(district => ({
		            		label: district,
		            		value: district,
		            		key: district,
	            		}))
		            }
		            placeholder={{
		            	label: "Selecione uma cidade", 
		            	value: null
		            }}
        		/>
				<RectButton style={styles.button} onPress={handlenavigateToPoints}>
					<View style={styles.buttonIcon}>
						<Text>
							<Icon name="arrow-right" color="#FFF" size={24} />
						</Text>
					</View>
					<Text style={styles.buttonText}>
						Entrar
					</Text>
				</RectButton>
			</View>

		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 32,
	},

	main: {
		flex: 1,
		justifyContent: 'center',
	},

	title: {
		color: '#322153',
		fontSize: 32,
		fontFamily: 'Ubuntu_700Bold',
		maxWidth: 260,
		marginTop: 64,
	},

	description: {
		color: '#6C6C80',
		fontSize: 16,
		marginTop: 16,
		fontFamily: 'Roboto_400Regular',
		maxWidth: 260,
		lineHeight: 24,
	},

	footer: {},

	select: {},

	input: {
		height: 60,
		backgroundColor: '#FFF',
		borderRadius: 10,
		marginBottom: 8,
		paddingHorizontal: 24,
		fontSize: 16,
	},

	button: {
		backgroundColor: '#34CB79',
		height: 60,
		flexDirection: 'row',
		borderRadius: 10,
		overflow: 'hidden',
		alignItems: 'center',
		marginTop: 8,
	},

	buttonIcon: {
		height: 60,
		width: 60,
		backgroundColor: 'rgba(0, 0, 0, 0.1)',
		justifyContent: 'center',
		alignItems: 'center',
	},

	buttonText: {
		flex: 1,
		justifyContent: 'center',
		textAlign: 'center',
		color: '#FFF',
		fontFamily: 'Roboto_500Medium',
		fontSize: 16,
	}
});

export default Home;