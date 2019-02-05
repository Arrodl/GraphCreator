import React, { Component } from 'react';
import Node from './components/Node';
import Connection from './components/Connection';
import './App.scss';
import { Stage, Layer } from "react-konva";
import GraphService from './services/Graph';

import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import TextField from '@material-ui/core/TextField';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { async } from 'q';

class App extends Component {
    
    graphService: GraphService;

    state: {
        nodes: any[],
        connections: any[],
        openState: false,
        openConnection: false,
        state: any,
        connection: any,
        markedArr: number[]
    }

    constructor (props: any) {
        super(props);

        this.graphService = new GraphService();

        this.state = {
            nodes: [],
            connections: [],
            openState: false,
            openConnection: false,
            state: null,
            connection: null,
            markedArr: []
        }
    }

    saveLocation (id : string, location: any) {
        this.graphService.saveIDLocation(id, location);
        this.forceUpdate();
    }

    displayGraphs () {
        let display = this.state.nodes.map(data =>  {
            // Default location
            let location = this.graphService.getLocationByID(data.id);

            let marked = this.state.markedArr.filter(x => x === data.id);

            let initial = false;

            if (marked) {
                if (this.state.markedArr[0] === data.id) {
                    initial = true;
                }
            }

            return <Node 
                        key={data.id} 
                        data={data} 
                        saveLocation={this.saveLocation.bind(this)} 
                        x={location["x"] as number} 
                        y={location["y"] as number}
                        onOpen={this.openNode.bind(this)}
                        marked={marked.length > 0}
                        initial={initial}
                        markForConnection={this.markForConnection.bind(this)}
                    />;
        })

        return display;
    }

    displayConnections () {
        let display = this.state.connections.map(data => {
            let initialLocation = this.graphService.getLocationByID(data.initial_id);
            let finalLocation = this.graphService.getLocationByID(data.final_id);

            return <Connection
                        key={`con_${data.id}`}
                        data={data}
                        initialLocation={initialLocation}
                        finalLocation={finalLocation}
                        onOpen={this.openConnection.bind(this)}
                    />
        });

        return display;
    }

    async componentDidMount () {
        let response = await this.graphService.getStates();

        let connections = [];

        for (let i = 0; i < response.length; i++) {
            let node = response[i];
            for (let j = 0; j < node.connections.length; j++) {
                connections.push(node.connections[j]);
            }
        }

        this.setState({
            nodes: response,
            connections: connections
        })
    }

    openNode = (data: any) => {
        this.setState({
            state: data,
            openState: true
        })
    }
    
    openConnection = (data: any) => {
        this.setState({
            connection: data,
            openConnection: true
        })
    }

    handleCloseState = () => {
        this.setState({
            state: null,
            openState: false
        })
    }

    openTravel = (data: any) => {
        this.setState({
            connection: data,
            openConnection: true
        })
    }

    handleCloseConnection = () => {
        this.setState({
            connection: null,
            openConnection: false
        })
    }

    changeName = (event : any) => {
        let value = event.target.value;
        this.setState({
            state: {
                ...this.state.state,
                name: value
            }
        })
    }

    changeDescription = (event : any) => {
        let value = event.target.value;
        this.setState({
            state: {
                ...this.state.state,
                description: value
            }
        })
    }

    changeTextConnection = (event : any, identifier: string) => {
        let value = event.target.value;
        this.setState({
            connection: {
                ...this.state.connection,
                [identifier]: value
            }
        })
    }

    changeSwitchState = (event : any) => {
        let value = event.target.checked;
        this.setState({
            state: {
                ...this.state.state,
                is_media_necessary: value
            }
        })
    }

    changeSwitchConnection = (event : any, identifier : string) => {
        let value = event.target.checked;
        this.setState({
            connection: {
                ...this.state.connection,
                [identifier]: value
            }
        })
    }

    sendConnectionData = async () => {
        if (this.state.connection.id) {
            let success = await this.graphService.updateConnection(this.state.connection);

            if (success) {
                let lastConnections = this.state.connections.filter(x => x.id !== this.state.connection.id)

                this.setState({
                    connections: [
                        ...lastConnections,
                        this.state.connection
                    ]
                })

                this.handleCloseConnection();
            }
        } else {
            let data = await this.graphService.createConnection(this.state.connection);

            if (data) {
                let lastConnections = this.state.connections;

                this.setState({
                    connections: [
                        ...lastConnections,
                        data
                    ],
                    markedArr: []
                })

                this.handleCloseConnection();
            }
        }
    }

    sendStateData = async () => {
        if (this.state.state.id) {
            let success = await this.graphService.updateState(this.state.state);

            if (success) {
                let lastStates = this.state.nodes.filter(x => x.id !== this.state.state.id)

                this.setState({
                    nodes: [
                        ...lastStates,
                        this.state.state
                    ]
                })

                this.handleCloseState();
            }
        } else {
            let data = await this.graphService.createState(this.state.state);

            if (data) {
                let lastStates = this.state.nodes;

                this.setState({
                    nodes: [
                        ...lastStates,
                        data
                    ]
                })

                this.handleCloseState();
            }
        }
    }

    createState = () => {
        this.setState({
            state: {
                id: null,
                name: "",
                description: "",
                is_media_necessary: false
            },
            openState: true
        })
    }

    createConnection = () => {
        this.setState({
            connection: {
                id: null,
                initial_id: this.state.markedArr[0],
                final_id: this.state.markedArr[1],
                color: "",
                is_normal_user_allowed: false,
                is_visible: false,
                option_text: "",
                selected_text: ""
            },
            openConnection: true
        })
    }

    markForConnection = (id: number) => {
        if (this.state.markedArr.filter(x => x === id).length === 0) {
            if (this.state.markedArr.length === 0) {
                this.setState({
                    markedArr: [id]
                })
            } else if (this.state.markedArr.length === 1) {
                let newArr = this.state.markedArr;
                newArr.push(id);
                this.setState({
                    markedArr: newArr
                })
            } else {
                let newArr = this.state.markedArr;
                newArr[0] = newArr[1];
                newArr[1] = id;
                this.setState({
                    markedArr: newArr
                })
            }
        } else {
            let newArr = this.state.markedArr.filter(x => x !== id);

            this.setState({
                markedArr: newArr
            })
        }
    }

    deleteItem = async (id: number, type: string) => {
        if (type === "connection") {
            let idToDelete = await this.graphService.deleteConnection(id);

            let connections = this.state.connections.filter((x : any) => x.id !== idToDelete);

            this.setState({
                connections: connections
            })
        }
    }

    render() {
        const { state, connection } = this.state;

        return (
            <React.Fragment>
                <Stage className="App" width={window.innerWidth} height={window.innerHeight}>
                    <Layer>
                        {this.displayConnections()}
                        {this.displayGraphs()}
                    </Layer>
                </Stage>
                <Dialog onClose={this.handleCloseState} aria-labelledby="simple-dialog-title" open={this.state.openState}>
                    <DialogTitle id="simple-dialog-title">{state && state.id ? "Edita" : "Crea"} el estado</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            value={state ? state.name : ""}
                            label="Nombre"
                            type="text"
                            onChange={this.changeName.bind(this)}
                            fullWidth
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Descripción"
                            value={state ? state.description : ""}
                            type="text"
                            onChange={this.changeDescription.bind(this)}
                            multiline
                            fullWidth
                        />
                        <FormControlLabel 
                            control={
                                <Switch
                                    checked={state ? state.is_media_necessary : false}
                                    onChange={this.changeSwitchState.bind(this)}
                                    value="Es necesario subir archivos"
                                    color="primary"
                                />
                            }
                            label={"Es necesario subir archivos."}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleCloseState} color="secondary">
                            Cancelar
                        </Button>
                        <Button onClick={this.sendStateData} color="secondary">
                            {state && state.id ? "Actualizar" : "Crear"}
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog onClose={this.handleCloseConnection} aria-labelledby="simple-dialog-title" open={this.state.openConnection}>
                    <DialogTitle id="simple-dialog-title">{connection && connection.id ? "Edita" : "Crea"} la conexión</DialogTitle>
                    <DialogContent>
                        <FormControlLabel 
                            control={
                                <Switch
                                    checked={connection ? connection.is_normal_user_allowed : false}
                                    onChange={event => this.changeSwitchConnection(event, "is_normal_user_allowed")}
                                    value="Tipo de usuario: On(cliente) Off(reparador)"
                                    color="primary"
                                />
                            }
                            label={"Tipo de usuario: On(cliente) Off(reparador)"}
                        />
                        <FormControlLabel 
                            control={
                                <Switch
                                    checked={connection ? connection.is_visible : false}
                                    onChange={event => this.changeSwitchConnection(event, "is_visible")}
                                    value="Opcion visible"
                                    color="primary"
                                />
                            }
                            label={"Opcion visible"}
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Descripción"
                            value={connection ? connection.description : ""}
                            type="text"
                            onChange={event => this.changeTextConnection(event, "description")}
                            multiline
                            fullWidth
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Texto de la opción"
                            value={connection ? connection.option_text : ""}
                            type="text"
                            onChange={event => this.changeTextConnection(event, "option_text")}
                            fullWidth
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Texto a mostrar en estado en caso de haberse seleccionado"
                            value={connection ? connection.selected_text : ""}
                            type="text"
                            onChange={event => this.changeTextConnection(event, "selected_text")}
                            fullWidth
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Selecciona el color de la opción"
                            value={connection ? connection.color : ""}
                            type="color"
                            onChange={event => this.changeTextConnection(event, "color")}
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button  color="secondary" onClick={() => {
                            this.deleteItem(connection.id, "connection");
                        }}>
                            Eliminar
                        </Button>
                        <Button onClick={this.handleCloseConnection} color="secondary">
                            Cancelar
                        </Button>
                        <Button onClick={this.sendConnectionData} color="secondary">
                            {connection && connection.id ? "Actualizar" : "Crear"}
                        </Button>
                    </DialogActions>
                </Dialog>
                <div className="action_section">
                {this.state.markedArr.length === 2 ? 
                    <Button color="primary" onClick={this.createConnection.bind(this)}>
                        Crear conexión
                    </Button>
                : ""}
                    <Button color="primary" onClick={this.createState.bind(this)}>
                        Crear estado
                    </Button>
                </div>
            </React.Fragment>
        );
    }
}

export default App;
