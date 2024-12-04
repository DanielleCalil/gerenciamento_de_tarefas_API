const express = require ('express');
const router = express.Router();

//Controllers
const tarefasController = require ('../controllers/tarefas');

router.get ('/tarefas', (tarefasController.listarTarefas));
router.post ('/tarefas', (tarefasController.cadastrarTarefa));
router.patch ('/tarefas', (tarefasController.atualizarTarefa));
router.delete ('/tarefas', (tarefasController.excluirTarefa));