const db = require("../database/connection");
var fs = require("fs-extra");
const express = require("express");
const router = express.Router();

module.exports = {
  async listarTarefas(request, response) {
    try {
      const { userId } = request.body; // Obtém o userId do corpo da requisição
  
      console.log("Requisição recebida no servidor:", request.body);
  
      if (!userId) {
        console.log('userId não fornecido.');
        return response.status(400).json({
          sucesso: false,
          mensagem: "userId não fornecido.",
        });
      }
  
      // Consulta ao banco de dados com o nome correto da coluna
      const tarefas = await db.query(
        "SELECT * FROM tarefas WHERE userId = ?", 
        [userId]
      );
  
      console.log("Resultado da consulta ao banco:", tarefas);
  
      // Verifica se nenhuma tarefa foi encontrada
      if (tarefas[0].length === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: "Nenhuma tarefa encontrada para este usuário.",
        });
      }
  
      return response.status(200).json({
        sucesso: true,
        dados: tarefas[0], // Retorna as tarefas encontradas
      });
    } catch (error) {
      console.error("Erro ao listar tarefas:", error);
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro ao listar tarefas.",
        dados: error.message,
      });
    }
  },
  
  
  

  async cadastrarTarefa(request, response) {
    try {
      // Obtém os dados da requisição
      const { titulo, descricao, status, userId } = request.body;
      const statusParsed = status || "pendente";

      // Consulta SQL para inserir a tarefa com o userId
      const sql = `INSERT INTO tarefas (titulo, descricao, status, userId) VALUES (?, ?, ?, ?)`;
      const values = [titulo, descricao, statusParsed, userId];

      // Executa a consulta SQL
      const execSql = await db.query(sql, values);
      const tarefaCod = execSql[0].insertId;

      // Retorna a resposta com sucesso
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
      const { userId } = request.body; // O userId vem no corpo da requisição
  
      console.log('ID da tarefa:', id);
      console.log('userId no backend:', userId);
  
      // Verifica se o userId está presente
      if (!userId) {
        return response.status(400).json({
          sucesso: false,
          mensagem: "userId é obrigatório.",
        });
      }
  
      // Verifique se a tarefa existe para o usuário fornecido
      const verificaTarefa = await db.query(
        "SELECT * FROM tarefas WHERE id = ? AND userId = ?",
        [id, userId]
      );
  
      if (verificaTarefa[0].length === 0) {
        console.log('Tarefa não encontrada ou usuário não autorizado.');
        return response.status(404).json({
          sucesso: false,
          mensagem: "Tarefa não encontrada ou usuário não autorizado.",
        });
      }
  
      // Se a tarefa foi encontrada, exclua-a
      const sql = "DELETE FROM tarefas WHERE id = ?";
      await db.query(sql, [id]);
  
      return response.status(200).json({
        sucesso: true,
        mensagem: `Tarefa ${id} excluída com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error.message);
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro ao excluir a tarefa.",
        dados: error.message,
      });
    }
  },
  
  

  async confirmarTarefa(request, response) {
    try {
      const { id } = request.params; // Obtém o ID da tarefa a partir dos parâmetros da URL

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

      // Atualiza o status da tarefa para "concluída"
      const sql = `UPDATE tarefas SET status = ? WHERE id = ?`;
      const values = ["concluída", id];
      await db.query(sql, values);

      // Obtém a tarefa atualizada
      const tarefaAtualizada = await db.query(
        "SELECT * FROM tarefas WHERE id = ?",
        [id]
      );

      // Verifica se a tarefa foi retornada corretamente
      if (!tarefaAtualizada[0][0]) {
        return response.status(500).json({
          sucesso: false,
          mensagem: "Erro ao obter a tarefa atualizada.",
        });
      }

      return response.status(200).json({
        sucesso: true,
        dados: tarefaAtualizada[0][0], // Retorna a tarefa atualizada
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
