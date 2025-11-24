import bcrypt
def gerar_senha(senha):
    hashed = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt())
    hashed_senha = hashed.decode('utf-8')
    return hashed_senha

queries_db = {
    
    "usuario": """
        CREATE TABLE IF NOT EXISTS TCC.USUARIO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            senha VARCHAR(255) NOT NULL,
            username VARCHAR(50) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    """,

    "PROGRAMA_TREINO": """
        CREATE TABLE IF NOT EXISTS TCC.PROGRAMA_TREINO (
            id_programa_treino INT AUTO_INCREMENT PRIMARY KEY,
            id_usu INT NOT NULL,
            nome VARCHAR(100) NOT NULL,
            descricao VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (id_usu)
                REFERENCES TCC.USUARIO(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    """,

    "treino": """
        CREATE TABLE IF NOT EXISTS TCC.TREINO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            descricao VARCHAR(255),
            id_usuario INT NOT NULL,
            id_programa_treino INT NULL,
            duracao INT,
            dificuldade VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (id_usuario)
                REFERENCES TCC.USUARIO(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
            FOREIGN KEY (id_programa_treino)
                REFERENCES TCC.PROGRAMA_TREINO(id_programa_treino)
                ON DELETE SET NULL
                ON UPDATE CASCADE
        );
    """,

    "exercicio_treino": """
        CREATE TABLE IF NOT EXISTS TCC.EXERCICIO_TREINO (
            id_ex_treino INT AUTO_INCREMENT PRIMARY KEY,
            nome_exercicio VARCHAR(100) NOT NULL,
            equipamento VARCHAR(100) NOT NULL,
            grupo_muscular VARCHAR(100) NOT NULL,
            id_treino INT NOT NULL,
            series INT,
            descanso INT,
            reps INT,
            FOREIGN KEY (id_treino)
                REFERENCES TCC.TREINO(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    """,

     "sessao_treino": """
        CREATE TABLE IF NOT EXISTS TCC.SESSAO_TREINO (
            id_sessao INT AUTO_INCREMENT PRIMARY KEY,
            duracao_sessao INT,
            descricao TEXT,
            id_treino INT NOT NULL,
            FOREIGN KEY (id_treino)
                REFERENCES TCC.TREINO(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    """,

    "series": """
        CREATE TABLE IF NOT EXISTS TCC.SERIES (
            id_serie INT AUTO_INCREMENT PRIMARY KEY,
            numero_serie INT NOT NULL CHECK (numero_serie > 0),
            repeticoes INT NOT NULL CHECK (repeticoes > 0),
            carga DECIMAL(5,2) CHECK (carga >= 0),
            id_ex_treino INT NOT NULL,
            id_sessao INT NOT NULL,
            FOREIGN KEY (id_ex_treino)
                REFERENCES TCC.EXERCICIO_TREINO(id_ex_treino)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
            FOREIGN KEY (id_sessao)
                REFERENCES TCC.SESSAO_TREINO(id_sessao)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    """,

    "dieta": """
        CREATE TABLE IF NOT EXISTS TCC.DIETA (
    id_dieta INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    id_usuario INT NOT NULL,
    
    CONSTRAINT fk_dieta_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES TCC.USUARIO(id)
);
    """,

    "refeicoes": """
        CREATE TABLE IF NOT EXISTS TCC.REFEICOES (
    id_refeicao INT AUTO_INCREMENT PRIMARY KEY,
    calorias INT,
    alimentos VARCHAR(5000) NOT NULL,
    tipo_refeicao VARCHAR(50) NOT NULL,
    id_dieta INT NOT NULL,
    
    CONSTRAINT fk_refeicao_dieta
        FOREIGN KEY (id_dieta)
        REFERENCES TCC.DIETA(id_dieta)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
""",
"usuario_primario": f"""
INSERT INTO TCC.USUARIO (nome, email, username, senha)
SELECT 'Admin', 'tcc@gmail.com', 'tcc', '{gerar_senha('tcc1234')}'
WHERE NOT EXISTS (
    SELECT 1
    FROM TCC.USUARIO
    WHERE username = 'tcc' OR email = 'tcc@gmail.com'
);

"""
}
