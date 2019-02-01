import React from 'react';
import './Node.scss';
import { Rect } from "react-konva";

export default class Node extends React.Component {

    state = {
        x: 50,
        y: 50
    }

    handleClick = () => {
        "Se preciono"
    }

    onDragMove = (event: any) => {
        console.log(event)
        this.setState({
            x: event.target.x(),
            y: event.target.y()
        })
    }

    render () {

        return (
            <Rect
                x={this.state.x}
                y={this.state.y}
                width={50}
                height={50}
                fill={"white"}
                onClick={this.handleClick}
                onDragEnd={this.onDragMove}
            />
        )

    }

}