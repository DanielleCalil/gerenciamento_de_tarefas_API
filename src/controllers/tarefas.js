const db = require("../database/connection");
var fs = require("fs-extra");
const express = require("express");
const router = express.Router();

module.exports = {
  async listarTarefas(request, response) {
    try {
      const sql = `SELECT * FROM tarefas`;

      // Executa a query para buscar todas as tarefas
      const execSql = await db.query(sql);

      return response.status(200).json({
        sucesso: true,
        dados: execSql[0], // Retorna a lista de tarefas
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
      const statusParsed = status || "pendente"; // Define 'pendente' como padrão, caso não enviado

      const sql = `INSERT INTO tarefas (titulo, descricao, status) VALUES (?, ?, ?)`;
      const values = [titulo, descricao, statusParsed];

      // Executa a query para inserir a tarefa
      const execSql = await db.query(sql, values);
      const tarefaCod = execSql[0].insertId; // ID da tarefa inserida

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

  async atualizarTarefa(request, response) {
    try {
      const { id } = request.params; // ID da tarefa a ser atualizada
      const { titulo, descricao, status } = request.body;
      const statusParsed = status || "pendente"; // Define 'pendente' como padrão, caso não enviado

      // Verifica se a tarefa existe
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

      // Atualiza a tarefa
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
      const { id } = request.params; // ID da tarefa a ser excluída

      // Verifica se a tarefa existe
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

      // Exclui a tarefa
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
