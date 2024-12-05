const bcrypt = require('bcrypt');
const db = require("../database/connection");

module.exports = {
    async listarUsuarios(request, response) {
        try {
            const sqlListarUsuarios = `SELECT id, nome, email, data_criacao FROM usuarios`;
            const [usuarios] = await db.query(sqlListarUsuarios);

            return response.status(200).json({
                sucesso: true,
                mensagem: "Usuários listados com sucesso.",
                dados: usuarios
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: "Erro ao listar usuários.",
                dados: error.message
            });
        }
    },
    async cadastrarUsuario(request, response) {
        try {
            const { nome, email, senha } = request.body;

            // Verificação de campos obrigatórios
            if (!nome || !email || !senha) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: "Todos os campos são obrigatórios: nome, email e senha.",
                });
            }

            // Verificar se o e-mail já está cadastrado
            const sqlVerificaEmail = `SELECT id FROM usuarios WHERE email = ?`;
            const [usuariosExistentes] = await db.query(sqlVerificaEmail, [email]);

            if (usuariosExistentes.length > 0) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: "E-mail já cadastrado.",
                });
            }

            // Hash da senha
            const senhaHash = await bcrypt.hash(senha, 10);

            // Instrução SQL para inserção
            const sqlInserirUsuario = `
                INSERT INTO usuarios (nome, email, senha) 
                VALUES (?, ?, ?);
            `;
            const values = [nome, email, senhaHash];
            const resultado = await db.query(sqlInserirUsuario, values);

            const usuarioId = resultado[0].insertId;

            return response.status(201).json({
                sucesso: true,
                mensagem: "Usuário cadastrado com sucesso.",
                dados: { id: usuarioId, nome, email },
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: "Erro ao cadastrar usuário.",
                dados: error.message,
            });
        }
    },

    async atualizarUsuario(request, response) {
        try {
            const { id } = request.params; // ID do usuário na URL
            const { nome, email, senha } = request.body;

            // Verificar se o usuário existe
            const sqlVerificaUsuario = `SELECT id FROM usuarios WHERE id = ?`;
            const [usuarioExistente] = await db.query(sqlVerificaUsuario, [id]);

            if (usuarioExistente.length === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: "Usuário não encontrado.",
                });
            }

            // Atualizar dados, incluindo senha, se fornecida
            let sqlAtualizarUsuario = `UPDATE usuarios SET nome = ?, email = ?`;
            const values = [nome, email];

            if (senha) {
                const senhaHash = await bcrypt.hash(senha, 10);
                sqlAtualizarUsuario += `, senha = ?`;
                values.push(senhaHash);
            }

            sqlAtualizarUsuario += ` WHERE id = ?`;
            values.push(id);

            await db.query(sqlAtualizarUsuario, values);

            return response.status(200).json({
                sucesso: true,
                mensagem: "Usuário atualizado com sucesso.",
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: "Erro ao editar usuário.",
                dados: error.message
            });
        }
    },

    async excluirUsuario(request, response) {
        try {
            const { id } = request.params; // ID do usuário na URL

            // Verificar se o usuário existe
            const sqlVerificaUsuario = `SELECT id FROM usuarios WHERE id = ?`;
            const [usuarioExistente] = await db.query(sqlVerificaUsuario, [id]);

            if (usuarioExistente.length === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: "Usuário não encontrado.",
                });
            }

            // Excluir usuário
            const sqlExcluirUsuario = `DELETE FROM usuarios WHERE id = ?`;
            await db.query(sqlExcluirUsuario, [id]);

            return response.status(200).json({
                sucesso: true,
                mensagem: "Usuário excluído com sucesso.",
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: "Erro ao excluir usuário.",
                dados: error.message
            });
        }
    },

    async logarUsuario(request, response) {
        try {
            const { email, senha } = request.body;

            if (!email || !senha) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: "E-mail e senha são obrigatórios.",
                });
            }

            // Busca o usuário pelo e-mail
            const sqlBuscaUsuario = `SELECT * FROM usuarios WHERE email = ?`;
            const [usuariosEncontrados] = await db.query(sqlBuscaUsuario, [email]);

            if (usuariosEncontrados.length === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: "Usuário não encontrado.",
                });
            }

            const usuario = usuariosEncontrados[0];

            // Verifica a senha
            const senhaValida = await bcrypt.compare(senha, usuario.senha);

            if (!senhaValida) {
                return response.status(401).json({
                    sucesso: false,
                    mensagem: "Senha incorreta.",
                });
            }

            return response.status(200).json({
                sucesso: true,
                mensagem: "Login realizado com sucesso.",
                dados: { id: usuario.id, nome: usuario.nome, email: usuario.email },
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: "Erro ao realizar login.",
                dados: error.message,
            });
        }
    }
};
