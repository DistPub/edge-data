import React from "react";

export default function App(props) {
    let [selected, setSelected] = React.useState()
    return <select onChange={event => {
        setSelected(event.target.value)
    }} value={selected}>{props.choices.map(choice => {
        return <option value={choice.value}>{choice.name}</option>
    })}
    </select>
}