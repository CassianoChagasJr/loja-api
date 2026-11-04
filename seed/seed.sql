-- Seed da loja-api (adaptado ao schema em português deste projeto)
-- Senha de todos: secret123  |  ana = ADMIN  |  cli = CLIENTE  |  mgr = MANAGER
--
-- Pré-requisito: subir a API uma vez (npm run start:dev) para o TypeORM
-- (synchronize) criar as tabelas.
--
-- Rodar a partir da pasta loja-api/ (Git Bash):
--   docker exec -i loja-postgres psql -U loja -d loja -v ON_ERROR_STOP=1 < seed/seed.sql
--
-- ATENÇÃO: apaga TODOS os dados (usuários, pedidos, endereços, pagamentos, galeria...).
--
-- Política: DELETE + ALTER SEQUENCE ... RESTART WITH 1 (ids voltam a 1),
-- tudo dentro de uma transação: se qualquer comando falhar, nada é alterado.

BEGIN;

-- Limpa na ordem das chaves estrangeiras (filhos antes dos pais)
DELETE FROM pagamentos;   -- FK pedidoId    -> orders
DELETE FROM order_itens;  -- FK orderId     -> orders
DELETE FROM orders;       -- FK enderecoId  -> enderecos
DELETE FROM enderecos;
DELETE FROM produto_imagens; -- FK produtoId -> produtos (galeria)
DELETE FROM produtos;     -- FK idCategoria -> categorias
DELETE FROM categorias;
DELETE FROM users;

ALTER SEQUENCE pagamentos_id_seq  RESTART WITH 1;
ALTER SEQUENCE order_itens_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq      RESTART WITH 1;
ALTER SEQUENCE enderecos_id_seq   RESTART WITH 1;
ALTER SEQUENCE produto_imagens_id_seq RESTART WITH 1;
ALTER SEQUENCE produtos_id_seq    RESTART WITH 1;
ALTER SEQUENCE categorias_id_seq  RESTART WITH 1;
ALTER SEQUENCE users_id_seq       RESTART WITH 1;

-- Hash bcrypt de "secret123" (o mesmo do seed oficial; conferir com seed/verify-seed.sh)
INSERT INTO users (username, email, password, perfil) VALUES
  ('ana', 'ana@loja.test', '$2b$10$2gYSaz98rFtxXgbjMktX..g1WvfCU3fZ8YrQVyK3rUYNCBzSfM2x2', 'ADMIN'),
  ('cli', 'cli@loja.test', '$2b$10$2gYSaz98rFtxXgbjMktX..g1WvfCU3fZ8YrQVyK3rUYNCBzSfM2x2', 'CLIENTE'),
  ('mgr', 'mgr@loja.test', '$2b$10$2gYSaz98rFtxXgbjMktX..g1WvfCU3fZ8YrQVyK3rUYNCBzSfM2x2', 'MANAGER');

INSERT INTO categorias (nome) VALUES
  ('Canecas'),
  ('Camisetas');

INSERT INTO produtos (nome, preco, estoque, "idCategoria") VALUES
  ('Caneca Nest', 39.90, 10, 1),
  ('Camiseta ADS', 59.90, 25, 2);

COMMIT;

SELECT id, username, perfil FROM users ORDER BY id;
SELECT id, nome, preco, estoque, "idCategoria" FROM produtos ORDER BY id;
