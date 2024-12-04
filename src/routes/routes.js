const express = require ('express');
const router = express.Router();

//Controllers
const livrosController = require ('../controllers/Livros');
const cursosController = require ('../controllers/Cursos');

router.get ('/autores', (autoresController.listarAutores));
router.post ('/autores', (autoresController.listarAutores));
router.patch ('/autores', (autoresController.listarAutores));
router.delete ('/autores', (autoresController.listarAutores));