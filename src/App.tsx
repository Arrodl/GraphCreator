import React, { Component } from 'react';
import Node from './components/Node';
import './App.scss';
import { Stage, Layer, Rect, Text } from "react-konva";

class App extends Component {

    render() {
        return (
            <Stage className="App" width={window.innerWidth} height={window.innerHeight}>
                <Layer>
                    <Node />
                </Layer>
            </Stage>
        );
    }
}

export default App;
