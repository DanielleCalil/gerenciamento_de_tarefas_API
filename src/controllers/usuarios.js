const bcrypt = require("bcrypt");
const db = require("../database/connection");

module.exports = {
  async listarUsuarios(request, response) {
    try {
      const { id } = request.body;

      let sqlListarUsuarios;
      let params = [];

      if (id) {
        sqlListarUsuarios = `SELECT id, nome, email, data_criacao FROM usuarios WHERE id = ?`;
        params = [id];
      } else {
        sqlListarUsuarios = `SELECT id, nome, email, data_criacao FROM usuarios`;
      }

      const [usuarios] = await db.query(sqlListarUsuarios, params);

      return response.status(200).json({
        sucesso: true,
        mensagem: "Usuários listados com sucesso.",
        dados: usuarios,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro ao listar usuários.",
        dados: error.message,
      });
    }
  },

  async cadastrarUsuario(request, response) {
    try {
      const { nome, email, senha } = request.body;

      if (
        !nome ||
        !email ||
        !senha ||
        nome.trim() === "" ||
        email.trim() === "" ||
        senha.trim() === ""
      ) {
        return response.status(400).json({
          sucesso: false,
          mensagem: "Todos os campos são obrigatórios: nome, email e senha.",
        });
      }

      const sqlVerificaEmail = `SELECT id FROM usuarios WHERE email = ?`;
      const [usuariosExistentes] = await db.query(sqlVerificaEmail, [email]);

      if (usuariosExistentes.length > 0) {
        return response.status(400).json({
          sucesso: false,
          mensagem: "E-mail já cadastrado.",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(senha, salt);

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

  async editarUsuario(request, response) {
    try {
      const { id } = request.params;
      const { nome, email, senha } = request.body;

      const sqlVerificaUsuario = `SELECT id FROM usuarios WHERE id = ?`;
      const [usuarioExistente] = await db.query(sqlVerificaUsuario, [id]);

      if (usuarioExistente.length === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: "Usuário não encontrado.",
        });
      }

      let sqlAtualizarUsuario = `UPDATE usuarios SET nome = ?, email = ?`;
      const values = [nome, email];

      if (senha && typeof senha === "string") {
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
        dados: error.message,
      });
    }
  },

  async excluirUsuario(request, response) {
    try {
      const { id } = request.params;

      const sqlVerificaUsuario = `SELECT id FROM usuarios WHERE id = ?`;
      const [usuarioExistente] = await db.query(sqlVerificaUsuario, [id]);

      if (usuarioExistente.length === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: "Usuário não encontrado.",
        });
      }

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
        dados: error.message,
      });
    }
  },

  async logarUsuario(request, response) {
    try {
      const { email, senha } = request.body;

      if (!email || !senha || email.trim() === "" || senha.trim() === "") {
        return response.status(400).json({
          sucesso: false,
          mensagem: "E-mail e senha são obrigatórios.",
        });
      }

      const sqlBuscaUsuario = `SELECT * FROM usuarios WHERE email = ?`;
      const [usuariosEncontrados] = await db.query(sqlBuscaUsuario, [email]);

      if (usuariosEncontrados.length === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: "Usuário não encontrado.",
        });
      }

      const usuario = usuariosEncontrados[0];

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
  },
};
