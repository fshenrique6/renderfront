import addimg from '../assets/+.png';

function Sidebar() {
    return (
        <>
            <style>{`
                *{
                    margin: 0;
                    padding: 0;
                }
                body {
                    background-color: #fff;
                }
                .log-out {
                    margin-top: auto;
                }
                .sidebar {
                    position: fixed;
                    left: 0;
                    top: 0;
                    width: 260px;
                    height: 100vh;
                    box-sizing: border-box;
                    background: #F3F4F6;
                    color: #142557;
                    padding: 32px 20px 20px 20px;
                    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    z-index: 2;
                    overflow-y: auto; /* Para rolar se o conteúdo for maior que a tela */
                }
                .sidebar-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 32px;
                }
                .sidebar-logo {
                    font-size: 2rem;
                    color: #142557;
                }
                .sidebar-title {
                    font-size: 2rem;
                    font-weight: bold;
                    color: #142557;
                }
                .titulo-mq {
                    margin-bottom: 10px;
                    font-size: 1rem;
                    color: #222;
                    font-weight: bold;
                }
                .quadro-btn {
                    width: 100%;
                    background: #2563eb;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 0;
                    font-size: 1rem;
                    font-weight: bold;
                    margin-bottom: 16px;
                    cursor: pointer;
                }
                .add-board-btn {
                    width: 100%;
                    background: #2563eb;
                    color: #2563eb;
                    border: 2px solid #2563eb;
                    border-radius: 8px;
                    padding: 8px 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
                .add-icon {
                    width: 24px;
                    height: 24px;
                }
                button:hover {
                    background: #1d4ed8;
                    color: #fff;
                }
            `}</style>

            <div className="sidebar">
                <div className="sidebar-header">
                    <span className="sidebar-logo">✔</span>
                    <span className="sidebar-title">ServiTask</span>
                </div>
                <p className="titulo-mq">Meus quadros:</p>
                <button className="quadro-btn">Quadro 1</button>
                <button className="add-board-btn">
                    <img src={addimg} alt="Adicionar quadro" className="add-icon" />
                </button>
                <button className="log-out">Sair →</button>
            </div>
        </>
    );
}

export default Sidebar;