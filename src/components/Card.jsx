

function Card(props) {
    return (
        <div className="card">
            <h1>{props.cardName}</h1>
            <p>{props.description}</p>
        </div>
    );
}

export default Card