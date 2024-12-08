const db = require("../database/connection");
var fs = require("fs-extra");
const express = require("express");
const router = express.Router();

module.exports = {
  async listarTarefas(request, response) {
    try {
      const sql = `SELECT * FROM tarefas`;

      const execSql = await db.query(sql);

      return response.status(200).json({
        sucesso: true,
        dados: execSql[0],
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro ao buscar tarefas.",
        dados: error.message,
      });
    }
  },

  async cadastrarTarefa(request, response) {
    try {
      const { titulo, descricao, status } = request.body;
      const statusParsed = status || "pendente";

      const sql = `INSERT INTO tarefas (titulo, descricao, status) VALUES (?, ?, ?)`;
      const values = [titulo, descricao, statusParsed];

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

      const sql = "DELETE FROM tarefas WHERE id = ?";
      await db.query(sql, [id]);

      return response.status(200).json({
        sucesso: true,
        mensagem: `Tarefa ${id} excluída com sucesso.`,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro ao excluir a tarefa.",
        dados: error.message,
      });
    }
  },
};
