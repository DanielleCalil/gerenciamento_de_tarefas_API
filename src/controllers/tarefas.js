const db = require("../database/connection");
var fs = require("fs-extra");
const express = require("express");
const router = express.Router();

module.exports = {
  async listarTarefas(request, response) {
    try {
      const { userId } = request.body;

      if (!userId) {
        return response.status(400).json({
          sucesso: false,
          mensagem: "userId não fornecido.",
        });
      }

      const tarefas = await db.query("SELECT * FROM tarefas WHERE userId = ?", [
        userId,
      ]);

      if (tarefas[0].length === 0) {
        return response.status(200).json({
          sucesso: true,
          mensagem: `Nenhuma tarefa encontrada para o usuário com ID: ${userId}.`,
          dados: [],
        });
      }

      return response.status(200).json({
        sucesso: true,
        dados: tarefas[0],
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro ao listar tarefas.",
        dados: error.message,
      });
    }
  },

  async cadastrarTarefa(request, response) {
    try {
      const { titulo, descricao, status, userId } = request.body;
      const statusParsed = status || "pendente";

      const sql = `INSERT INTO tarefas (titulo, descricao, status, userId) VALUES (?, ?, ?, ?)`;
      const values = [titulo, descricao, statusParsed, userId];

      const execSql = await db.query(sql, values);
      const tarefaCod = execSql[0].insertId;

      return response.status(200).json({
        sucesso: true,
        mensagem: `Tarefa cadastrada com sucesso.`,
        dados: { tarefa_cod: tarefaCod },
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro na requisição.",
        dados: error.message,
      });
    }
  },

  async editarTarefa(request, response) {
    try {
      const { id } = request.params;
      const { titulo, descricao, status } = request.body;
      const statusParsed = status || "pendente";

      const verificaTarefa = await db.query(
        "SELECT * FROM tarefas WHERE id = ?",
        [id]
      );
      if (verificaTarefa[0].length === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: "Tarefa não encontrada.",
        });
      }

      const sql = `UPDATE tarefas SET titulo = ?, descricao = ?, status = ? WHERE id = ?`;
      const values = [titulo, descricao, statusParsed, id];
      await db.query(sql, values);

      return response.status(200).json({
        sucesso: true,
        mensagem: `Tarefa ${id} atualizada com sucesso.`,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro ao atualizar a tarefa.",
        dados: error.message,
      });
    }
  },

  async excluirTarefa(request, response) {
    try {
      const { id } = request.params;
      const { userId } = request.body;

      if (!userId) {
        return response.status(400).json({
          sucesso: false,
          mensagem: "userId é obrigatório.",
        });
      }

      const verificaTarefa = await db.query(
        "SELECT * FROM tarefas WHERE id = ? AND userId = ?",
        [id, userId]
      );

      if (verificaTarefa[0].length === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: "Tarefa não encontrada ou usuário não autorizado.",
        });
      }

      const sql = "DELETE FROM tarefas WHERE id = ?";
      await db.query(sql, [id]);

      return response.status(200).json({
        sucesso: true,
        mensagem: `Tarefa ${id} excluída com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error.message);
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro ao excluir a tarefa.",
        dados: error.message,
      });
    }
  },

  async confirmarTarefa(request, response) {
    try {
      const { id } = request.params;

      const verificaTarefa = await db.query(
        "SELECT * FROM tarefas WHERE id = ?",
        [id]
      );
      if (verificaTarefa[0].length === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: "Tarefa não encontrada.",
        });
      }

      const sql = `UPDATE tarefas SET status = ? WHERE id = ?`;
      const values = ["concluída", id];
      await db.query(sql, values);

      const tarefaAtualizada = await db.query(
        "SELECT * FROM tarefas WHERE id = ?",
        [id]
      );

      if (!tarefaAtualizada[0][0]) {
        return response.status(500).json({
          sucesso: false,
          mensagem: "Erro ao obter a tarefa atualizada.",
        });
      }

      return response.status(200).json({
        sucesso: true,
        dados: tarefaAtualizada[0][0],
        mensagem: `Tarefa ${id} concluída com sucesso.`,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro ao concluir a tarefa.",
        dados: error.message,
      });
    }
  },
};
