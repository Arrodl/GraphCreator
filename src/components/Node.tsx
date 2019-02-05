import React from 'react';
import './Node.scss';
import { Circle, Text } from "react-konva";

interface INodeProps {
    data: any,
    saveLocation(id: string, location: any) : void,
    x: number,
    y: number,
    marked: Boolean,
    initial: Boolean,
    onOpen(data: any) : void,
    markForConnection(id: number) : void
}

export default class Node extends React.Component<INodeProps> {

    state: {
        x: number,
        y: number
    }

    constructor(props: any) {
        super(props);

        this.state = {
            x: this.props.x,
            y: this.props.y
        }
    }

    handleClick = () => {
        this.props.onOpen(this.props.data);
    }

    onDragMove = (event: any) => {
        this.props.saveLocation(this.props.data.id, { x: event.target.x(), y: event.target.y() });

        this.setState({ x: event.target.x(), y: event.target.y() })
    }

    render () {

        return (
            <React.Fragment>
                <Circle
                    x={this.state.x}
                    y={this.state.y}
                    radius={50}
                    draggable
                    fill={"white"}
                    onClick={this.handleClick}
                    onDragEnd={this.onDragMove}
                />
                <Text
                    x={this.state.x - 45}
                    y={this.state.y - 5}
                    width={90}
                    text={this.props.data.name}
                    align="center"
                />
                <Circle
                    x={this.state.x - 45}
                    y={this.state.y - 45}
                    radius={10}
                    fill={this.props.marked ? "green" : "yellow"}
                    onClick={() => {
                        this.props.markForConnection(this.props.data.id)
                    }}
                />
                <Text
                    x={this.state.x - 45}
                    y={this.state.y - 45}
                    width={10}
                    align="center"
                    text={this.props.marked ? this.props.initial ? "I" : "F" : ""}
                    onClick={() => {
                        this.props.markForConnection(this.props.data.id)
                    }}
                />
            </React.Fragment>
        )

    }

}