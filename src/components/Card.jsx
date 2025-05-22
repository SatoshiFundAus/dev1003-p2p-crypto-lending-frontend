import styles from './LandingPage.module.css'

function Card(props) {
    return (
        <div className={`${styles.card} ${props.className || ''}`}>
            <h1>{props.cardName}</h1>
            <div className={styles.cardContent}>
                <p>{props.description}</p>
            </div>
        </div>
    );
}

export default Card

