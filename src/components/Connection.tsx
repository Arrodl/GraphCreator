import React from 'react'
import './Connection.scss';
import { Line, Arrow } from "react-konva";

interface IConnectionProps {
    data: any,
    initialLocation: any,
    finalLocation: any,
    onOpen(data: any) : void
}

export default class Connection extends React.Component<IConnectionProps> {

    handleClick = () => {
        this.props.onOpen(this.props.data);
    }

    render () {
        return(
            <React.Fragment>
                <Arrow 
                    points={[this.props.initialLocation.x, this.props.initialLocation.y, this.props.finalLocation.x, this.props.finalLocation.y]}
                    stroke={this.props.data.color ? this.props.data.color : "white"}
                    pointerLength={60}
                    pointerWidth={25}
                    tension={1}
                    strokeWidth={5}
                    onClick={this.handleClick}
                />
            </React.Fragment>
        )
    }

}