const express = require ('express');
const router = express.Router();

//Controllers
const tarefasController = require ('../controllers/tarefas');
const usuariosController = require ('../controllers/usuarios');

router.post ('/tarefas', (tarefasController.listarTarefas));
router.post ('/tarefasCadastrar', (tarefasController.cadastrarTarefa));
router.patch ('/tarefasEditar/:id', (tarefasController.atualizarTarefa));
router.delete ('/tarefasDeletar/:id', (tarefasController.excluirTarefa));

router.post ('/usuarios', (usuariosController.listarUsuarios));
router.post ('/usuariosCadastrar', (usuariosController.cadastrarUsuario));
router.patch ('/usuariosEditar/:id', (usuariosController.atualizarUsuario));
router.delete ('/usuariosDeletar/:id', (usuariosController.excluirUsuario));
router.post ('/usuariosLogar', (usuariosController.logarUsuario));

module.exports = router;
