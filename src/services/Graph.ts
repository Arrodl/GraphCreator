import { BASE_URL } from '../networking/Endpoint';
import axios, { AxiosResponse } from 'axios';
import SecureLS from 'secure-ls';
import { string } from 'prop-types';

export interface ILocation {
    x: number;
    y: number;
}

export default class GraphService {

    props: { 
        actions: { 
            create_state: string; 
            create_connection: string; 
            get_states: string; 
            update_state: string; 
            update_connection: string; 
            delete_state: string; 
            delete_connection: string; 
        }; 
    };

    secureLS: SecureLS;

    constructor () {
        this.props = {
            actions: {
                create_state: '/graph/state',
                create_connection: '',
                get_states: '/graph',
                update_state: '/graph/state/{id}',
                update_connection: '',
                delete_state: '',
                delete_connection: ''
            }
        }

        this.secureLS = new SecureLS();

        axios.defaults.baseURL = BASE_URL;
    }

    saveIDLocation (id: string, location: Location) {
        let stringJSON = JSON.stringify(location);
        this.secureLS.set(`location_${id}`, stringJSON);
    }

    getLocationByID (id: StaticRange) : any {
        let data = this.secureLS.get(`location_${id}`);
        return data ? JSON.parse(data) : { x: 50, y: 50 };
    }

    async getStates () : Promise<any> {
        return await axios.get(this.props.actions.get_states)
            .then(response => {
                return response.data;
            }).catch(error => {
                return error
            })
    }

    async updateState (data: any) : Promise<Boolean> {
        let endpoint = this.props.actions.update_state;

        endpoint = endpoint.replace("{id}", data.id)

        return await axios.put(endpoint, { state: data })
            .then(response => {
                return true;
            }).catch(error => {
                return false;
            })
    }

    async createState (data: any) : Promise<any> {
        return await axios.post(this.props.actions.create_state, { state: data })
            .then(response => {
                return response.data.state;
            }).catch(error => {
                return null;
            })
    }

}