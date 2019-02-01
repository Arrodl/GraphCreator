import React, { Component } from 'react';
import Node from './components/Node';
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

class App extends Component {
    
    graphService: GraphService;

    state: {
        nodes: any[],
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
            openState: false,
            openConnection: false,
            state: null,
            connection: null,
            markedArr: []
        }
    }

    saveLocation (id : string, location: any) {
        this.graphService.saveIDLocation(id, location);
    }

    displayGraphs () {
        let display = this.state.nodes.map(data =>  {
            // Default location
            let location = this.graphService.getLocationByID(data.id);

            let marked = this.state.markedArr.filter(x => x === data.id);

            return <Node 
                        key={data.id} 
                        data={data} 
                        saveLocation={this.saveLocation.bind(this)} 
                        x={location["x"] as number} 
                        y={location["y"] as number}
                        onOpen={this.openNode.bind(this)}
                        marked={marked.length > 0}
                        markForConnection={this.markForConnection.bind(this)}
                    />;
        })

        return display;
    }

    async componentDidMount () {
        let response = await this.graphService.getStates();

        this.setState({
            nodes: response
        })
    }

    openNode = (data: any) => {
        this.setState({
            state: data,
            openState: true
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

    changeSwitch = (event : any) => {
        let value = event.target.checked;
        this.setState({
            state: {
                ...this.state.state,
                is_media_necessary: value
            }
        })
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
        }
    }

    render() {
        const { state, connection } = this.state;

        return (
            <React.Fragment>
                <Stage className="App" width={window.innerWidth} height={window.innerHeight}>
                    <Layer>
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
                                    onChange={this.changeSwitch.bind(this)}
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
                            Actualizar
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog onClose={this.handleCloseConnection} aria-labelledby="simple-dialog-title" open={this.state.openConnection}>
                    <DialogTitle id="simple-dialog-title">Edita la conexión</DialogTitle>
                    <DialogContent>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleCloseConnection} color="secondary">
                            Cancelar
                        </Button>
                        <Button onClick={this.sendStateData} color="secondary">
                            Actualizar
                        </Button>
                    </DialogActions>
                </Dialog>
                <div className="action_section">
                {this.state.markedArr.length === 2 ? 
                    <Button color="primary">
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
