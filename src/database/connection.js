 const mysql = require ('mysql2/promise')

 const bd_usuario = 'root';
 const bd_senha = '';
 const bd_servidor = '127.0.0.1';
 const bd_porta = '3306';
 const bd_banco = 'localhost'

 let connection
 
 const config = {
     host: bd_servidor,
     port: bd_porta,
     user: bd_usuario,
     password: bd_senha,
     database: bd_banco,
     waitForConnections: true,
     connectionLimit: 10,
     queueLimit: 0,
 }
 try {
     connection = mysql.createPool(config);
     console.log ('Conexão estabelecida com sucesso')
 } catch (error) {
     console.log (error);
 }

module.exports = connection;