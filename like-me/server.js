const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'likeme',
  password: '20062006',
  port: 5432,
});

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rutas
// Ruta GET: Obtener todos los posts
app.get('/posts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los posts:', error);
    res.status(500).send('Error al obtener los posts');
  }
});

// Ruta POST: Crear un nuevo post
app.post('/posts', async (req, res) => {
    console.log('Datos recibidos:', req.body); // Log para ver qué datos llegan
  
    const { titulo, img, descripcion } = req.body;
  
    if (!titulo || !img || !descripcion) {
      return res.status(400).send('Todos los campos son obligatorios');
    }
  
    try {
      const result = await pool.query(
        'INSERT INTO posts (titulo, img, descripcion, likes) VALUES ($1, $2, $3, 0) RETURNING *',
        [titulo, img, descripcion]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error al crear el post:', error.message, error.stack);
      res.status(500).send('Error al crear el post');
    }
  });
  

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

app.put('/posts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).send('Post no encontrado');
    }

    res.json(result.rows[0]); // Retorna el post actualizado
  } catch (error) {
    console.error('Error al actualizar likes:', error.message);
    res.status(500).send('Error al actualizar likes');
  }
});

app.delete('/posts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM posts WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).send('Post no encontrado');
    }

    res.send('Post eliminado exitosamente');
  } catch (error) {
    console.error('Error al eliminar el post:', error.message);
    res.status(500).send('Error al eliminar el post');
  }
});


